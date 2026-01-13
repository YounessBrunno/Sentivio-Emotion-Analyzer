import UploadForm from "features/video-analysis/components/UploadForm";
import { FingerprintIcon} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "public/assets/sentivio-logo.svg"
import { Button } from "shared/ui/button";

export default function UploadPage() {
    return (
        <div className="relative ">   
          <div className="absolute inset-0 flex items-center justify between">
            <Image src={logo} alt="Sentivio Logo" width={40} height={40} />
            <Button className="py-1 px-1.5 border-2 rounded-lg">
                <Link href="/sign-in" className="flex items-center gap-2">
                    Sign In <FingerprintIcon className="w-4 h-4" />
                </Link>
            </Button>
          </div>
          <main className="flex items-center justify-center h-screen">
             <UploadForm />
          </main>  
        
        </div>

    )
}