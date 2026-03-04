
import Squares from "@/components/Squares";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex justify-center">
      <div className="absolute inset-0 z-0 w-full h-screen">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#aea1a11d"
          hoverFillColor="#515151"
        />
      </div>
      <Navbar/>
    </div>
  );
}
