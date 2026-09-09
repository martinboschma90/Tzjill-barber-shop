/** Film grain + warm edge vignette, above the page but below the nav. */
export function GradientOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(26_22_18_/_0.45)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.55'/></svg>`,
          )}")`,
        }}
      />
    </div>
  )
}
