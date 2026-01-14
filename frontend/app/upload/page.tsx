import UploadForm from "features/video-analysis/components/UploadForm";
import { FingerprintIcon} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "public/assets/sentivio-logo2.svg"
import { Button } from "shared/ui/button";


export default function UploadPage() {
    return (
        <div className="relative">   
          <div className="absolute inset-x-0 top-0 w-full flex items-center justify-between mt-1.5 px-2">
            <Link href="/">
              <Image src={logo} alt="Sentivio Logo" width={33} height={33} />
            </Link>
            <Button className="py-1 px-1.5 border-2 border-gray-300 rounded-lg">
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