import Image from "next/image";
import Link from "next/link";
import logo from "public/assets/sentivio-logo3.svg";
import { Button } from "shared/ui/button";
import { FingerprintIcon } from "lucide-react";
import { Separator } from "shared/ui/separator";

export default function Header() {
    return (
        <header className="sticky z-50">
            <nav className="flex items-center justify-between max-w-100 mx-auto p-1 bg-white border rounded-full mt-1.5 select-none">
                  <Link href="/">
                   <Image src={logo} alt="Sentivio Logo" width={40} height={40} />
                  </Link>
                  <div className="flex items-center gap-4 font-semibold text-gray-800">
                    <Link href="/about">About</Link>
                    <Link href="/blog">Blog</Link>
                  </div>
                  <Button className="py-1 px-1.5  rounded-full">
                    <Link href="/sign-in" className="flex items-center gap-2">
                      Sign In <FingerprintIcon className="w-4 h-4" />
                    </Link>
                  </Button>
            </nav>
        </header>
    )
}
