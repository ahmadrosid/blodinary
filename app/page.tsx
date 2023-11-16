import UploadComponent from "@/components/upload";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <>
      <div className="w-full min-h-screen flex justify-center items-center relative">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div>
          <div className="py-6 text-center space-y-2">
            <h1 className="font-black text-6xl tracking-tighter text-blue-600">
              Blodinary
            </h1>
            <h1 className="font-normal text-xl tracking-tighter text-neutral-800">
              Upload blob file to Claudinary
            </h1>
          </div>
          <UploadComponent />
        </div>
      </div>
      <Toaster richColors />
    </>
  );
}
