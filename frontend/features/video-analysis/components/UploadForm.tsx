import Image from "next/image"
import { Card } from "shared/ui/card"
import img  from "public/assets/vid-upload.svg"
import { LockIcon } from "lucide-react"
import { useUploader } from "@/useUploader";

export default function UploadForm() {
    const uppy = useUploader();
    
    return  (
       <Card className="flex flex-col items-center h-100 w-75 p-2 border-2 border-dashed border:hover:animate-spin">
          <div className="flex flex-col flex-1 items-center justify-center gap-2 text-center">
              <Image src={img} width={200} height={200} alt="upload video" className="select-none" />
              <div>
                  <h3 className="font-extrabold text-md mb-1">Upload Video</h3>
                  <p className="font-space text-[11px] text-gray-700">200MB Max</p>
              </div>
          </div>
          <input
            type="file"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                uppy.addFile({
                    name: file.name,
                    type: file.type,
                    data: file,
                });
                }
            }}
            />
          <div className="flex items-end justify-center text-center">
                 <p className="flex items-center gap-1.5 text-[12px] font-medium">
                    <LockIcon width={12} height={12} />
                    Files stay private
                 </p>
          </div>
       </Card>
    )
}