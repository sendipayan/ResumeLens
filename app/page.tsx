import Squares from "@/components/Squares";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0 z-0 w-full h-full">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#aea1a11d"
          hoverFillColor="#515151"
        />
      </div>
    </div>
  );
}
