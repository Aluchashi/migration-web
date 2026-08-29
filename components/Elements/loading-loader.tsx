export function LoadingLoader() {
  return (
    <div className="uv-card" role="status" aria-label="Loading">
      <div className="uv-loader">
        <span>Loading</span>
        <div className="uv-words">
          <span className="uv-word">your profile</span>
          <span className="uv-word">job matches</span>
          <span className="uv-word">skill gaps</span>
          <span className="uv-word">your roadmap</span>
          <span className="uv-word">safety checks</span>
        </div>
      </div>
    </div>
  );
}
