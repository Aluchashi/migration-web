import { NextResponse } from "next/server";

import { lookupAgencyProfile, recommendAlternativeAgencies } from "@/lib/agency-risk";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { assessScamRisk, validateScamRiskInput, type VerificationStatus } from "@/lib/scam-risk";

function mapAgencyStatus(status: string | null): VerificationStatus {
  switch (status) {
    case "VERIFIED":
      return "verified";
    case "EXPIRED":
      return "expired";
    case "SUSPENDED":
      return "invalid";
    case "CANCELLED":
      return "invalid";
    case "INVALID":
      return "invalid";
    case "UNMATCHED":
      return "unknown";
    case "UNAVAILABLE":
      return "unavailable";
    default:
      return "unknown";
  }
}

function mapLicenseStatus(status: string | null): VerificationStatus {
  if (!status) return "unknown";

  switch (status) {
    case "ACTIVE":
      return "verified";
    case "EXPIRED":
      return "expired";
    case "SUSPENDED":
      return "invalid";
    case "CANCELLED":
      return "invalid";
    case "INVALID":
      return "invalid";
    default:
      return "unknown";
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateScamRiskInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.errors.join(" "), details: validation.errors },
      { status: 400 },
    );
  }

  const input = validation.data;
  const agencyLookup = lookupAgencyProfile(input.agencyName);

  const scoreInput = {
    ...input,
    agencyVerificationStatus: mapAgencyStatus(agencyLookup.verificationStatus),
    licenseStatus: mapLicenseStatus(agencyLookup.licenseStatus),
  };

  const assessment = assessScamRisk(scoreInput);
  const alternatives = recommendAlternativeAgencies({
    destinationCountry: input.destinationCountry,
    occupation: input.occupation,
    selectionReasons: input.selectionReasons,
  });

  return NextResponse.json({
    userId: user.id,
    agency: {
      name: input.agencyName,
      normalizedName: agencyLookup.normalizedName,
      found: agencyLookup.found,
      isVerified: agencyLookup.isVerified,
      verificationStatus: agencyLookup.verificationStatus,
      freshness: agencyLookup.freshness,
      isCurrent: agencyLookup.isCurrent,
      notes: agencyLookup.notes,
      source: agencyLookup.sourceName
        ? {
            name: agencyLookup.sourceName,
            type: agencyLookup.sourceType,
            url: agencyLookup.sourceUrl,
            reference: agencyLookup.sourceReference,
            documentUrl: agencyLookup.sourceDocumentUrl,
            retrievedAt: agencyLookup.retrievedAt,
          }
        : null,
      licenseStatus: agencyLookup.licenseStatus,
    },
    risk: {
      score: assessment.score,
      level: assessment.level,
      factors: assessment.factors,
      informationGaps: assessment.informationGaps,
      indicatorLabel: "Risk indicators detected",
      standardNote:
        "This result indicates reasons to investigate further. It is not a definitive finding of fraud.",
    },
    officialSource: agencyLookup.sourceName
      ? {
          name: agencyLookup.sourceName,
          type: agencyLookup.sourceType,
          url: agencyLookup.sourceUrl,
          reference: agencyLookup.sourceReference,
          documentUrl: agencyLookup.sourceDocumentUrl,
          retrievedAt: agencyLookup.retrievedAt,
          freshness: agencyLookup.freshness,
        }
      : null,
    alternatives,
  });
}
