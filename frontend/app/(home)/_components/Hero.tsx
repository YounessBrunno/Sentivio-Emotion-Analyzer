import Image from "next/image";
import Link from "next/link";
import logo  from "public/assets/sentivio-logo2.svg"
import noSignUpImg from "public/assets/no-signup-needed.svg"
import { Button } from "shared/ui/button";
import { PlusIcon } from "lucide-react";

export default function Hero() {
    return (
        <section>
            <div className="flex justify-center items-center flex-col space-y-2 text-center mt-36 select-none">
              <div>
                <h1 className="text-5xl sm:text-6xl mb-1">
                    New clarity<br/>in emotion analysis
                </h1>
                <p className="text-gray-600">
                   With Sentivio<Image className="mx-1 inline-block -rotate-17 align-baseline" src={logo} alt="sentivio logo" width={15} height={15}/>, emotional patterns are revealed over time.<br/>
                   Built for insight. Focused on emotion, never identity.
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <Button className="relative p-3 rounded-full">
                   <Link href="/upload" className="flex items-center gap-1">
                     <PlusIcon />
                     Upload File
                   </Link>
                   <Image className="hidden lg:block absolute -left-32 -bottom-10" src={noSignUpImg} alt="no signUp Needed Image" width={300} height={300} />
                </Button>
                <p className="text-[11px] font-space font-medium text-gray-700">200MB Max</p>
              </div>
            </div>
        </section>
    )
}