"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Copy, Expand, Loader2, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

async function uploadFile({
  cloudName,
  file,
}: {
  cloudName: string;
  file: File;
}) {
  const api_key = window.localStorage.getItem("CLAUDINARY_API_KEY");
  if (!api_key) throw new Error("Please setup CLAUDINARY_API_KEY!!!");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", api_key);
  formData.append("upload_preset", "public");

  return await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  ).then((r) => r.json());
}

type BlodFile = File & {
  url?: string;
};

export default function UploadComponent() {
  const [files, setFiles] = useState<BlodFile[]>([]);
  const [loadingState, setLoadingState] = useState<any>({});
  const [previewImage, setPreviewImage] = useState<any>(null);
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>(
    {}
  );
  const [CLAUDINARY_API_KEY, setApiKey] = useState<string | null>(null);

  const [dragOver, setDragOver] = useState<boolean>(false);
  const [fileDropError, setFileDropError] = useState<string>("");

  const onDragOver = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);

    const selectedFiles = Array.from(e.dataTransfer.files);

    if (selectedFiles.some((file) => file.type.split("/")[0] !== "image")) {
      return setFileDropError("Please provide only image files to upload!");
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setFileDropError("");
  };

  const fileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files as FileList);

    if (selectedFiles.some((file) => file.type.split("/")[0] !== "image")) {
      return setFileDropError("Please provide only image files to upload!");
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setFileDropError("");
  };

  const simulateLoading = async (file: File) => {
    try {
      setLoadingState((prev: any) => ({ ...prev, [file.name]: true }));
      const result = await uploadFile({ cloudName: "dr15yjl8w", file });
      setLoadingState((prev: any) => ({ ...prev, [file.name]: false }));
      setFiles((prev) => {
        const newFiles = [...prev.slice(0, prev.length - 1)];
        const lastFile = prev[prev.length - 1];
        lastFile.url = result.url;
        newFiles.push(lastFile);
        return newFiles;
      });
    } catch (e) {
      setLoadingState((prev: any) => ({ ...prev, [file.name]: false }));
      toast.error((e as Error).message);
    }
  };

  const handleDelete = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const handleCopy = (file: BlodFile) => {
    if (!file.url) return;

    navigator.clipboard.writeText(file.url).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  const formatNumberWithDots = (number: number): string => {
    const numStr = number.toString();
    const reversedStr = numStr.split("").reverse().join("");
    const withDots = reversedStr.replace(/(\d{3})(?=\d)/g, "$1.");
    return withDots.split("").reverse().join("");
  };

  const handlePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const generatePreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews((prev) => ({
        ...prev,
        [file.name]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    files.forEach((file) => {
      if (loadingState[file.name] === undefined) {
        generatePreview(file);
        simulateLoading(file);
      }
    });
  }, [files]);

  useEffect(() => {
    const CLAUDINARY_API_KEY =
      window.localStorage.getItem("CLAUDINARY_API_KEY");
    setApiKey(CLAUDINARY_API_KEY);
  }, []);

  return (
    <>
      <div className="dark:bg-neutral-800 bg-white border dark:border-neutral-700 w-full max-w-lg rounded-xl">
        <div className="border-b dark:border-neutral-700">
          <div className="flex flex-row justify-start items-center px-4 py-2 gap-2">
            <div className="rounded-full border p-2 flex flex-row justify-center items-center dark:border-neutral-700">
              <UploadCloud className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <p className="font-semibold mb-0">Upload files</p>
              <p className="text-sm text-neutral-500 -mt-1">
                Drag and drop your files. Will not be saved.
              </p>
            </div>
          </div>
        </div>
        <form>
          <label
            htmlFor="file"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div
              className={cn(
                "px-4 py-2 border-[1.5px] border-dashed dark:border-neutral-700 m-2 rounded-xl flex flex-col justify-start items-center hover:cursor-pointer",
                dragOver && "border-blue-600 bg-blue-50"
              )}
            >
              <div className="flex flex-col justify-start items-center">
                <UploadCloud
                  className={cn(
                    "h-5 w-5 text-neutral-600 my-4",
                    dragOver && "text-blue-500"
                  )}
                />
                <p className="font-semibold">
                  Choose a file or drag & drop it here
                </p>
                <p className="text-neutral-500 text-sm">
                  JPEG, PNG formats. Up to 50 MB.
                </p>
                <div className="px-3 py-1 border dark:border-neutral-700 rounded-xl mt-4 mb-2 drop-shadow-sm hover:drop-shadow transition-all hover:cursor-pointer bg-white dark:bg-neutral-700">
                  Select files
                </div>
              </div>
            </div>
          </label>
          <input
            type="file"
            name="file"
            id="file"
            className="hidden"
            onChange={fileSelect}
            multiple
          />
        </form>

        {CLAUDINARY_API_KEY ? (
          ""
        ) : (
          <div className="p-2 flex flex-col gap-2 border-t">
            <p className="text-sm font-semibold text-rose-500">
              Please add claudinary apikey!
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const value = e.currentTarget.value;
                window.localStorage.setItem("CLAUDINARY_API_KEY", value);
                setApiKey(value);
                toast.success("API key successfully set up!");
              }}
            >
              <input
                className="p-2 rounded-md text-sm px-2 border w-full shadow-sm focus:outline-none"
                placeholder="RqgsQ_y6J..."
                type="password"
                defaultValue={CLAUDINARY_API_KEY || ""}
              />
              <button className="text-sm bg-blue-700 p-2 px-4 text-white rounded-md shadow">
                Submit
              </button>
            </form>
          </div>
        )}
        {files.length > 0 && (
          <div className="w-full px-4 py-2 gap-2 flex flex-col justify-start items-center border-t dark:border-neutral-700 max-h-52 overflow-auto">
            {files.map((file, index) => {
              const isLoading = loadingState[file.name];
              const preview = imagePreviews[file.name];

              return (
                <div
                  key={index}
                  className="flex flex-row justify-between items-center border dark:border-neutral-700 rounded-lg px-2 py-1 w-full group"
                >
                  <div className="flex flex-row justify-start items-center gap-2">
                    <div>
                      {isLoading ? (
                        <div className="flex flex-row justify-center items-center gap-2 h-10 w-10 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                        </div>
                      ) : (
                        preview && (
                          <div className="relative h-14 w-14">
                            <Image
                              src={preview}
                              alt="Preview"
                              fill
                              className="rounded-md h-full w-full border"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex flex-col justify-start items-start gap-1">
                      <div className="flex flex-row justify-start items-center gap-2">
                        <div>
                          <p>{file.name}</p>
                          {file.url && (
                            <p className="truncate max-w-[200px]">
                              <a
                                href={file.url}
                                className="text-xs text-blue-500 truncate"
                                target="_blank"
                              >
                                {file.url}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {formatNumberWithDots(file.size)} Bytes
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-end items-center gap-2 pt-3">
                    <button
                      className="text-neutral-400 flex flex-row justify-end bg-neutral-100 p-1 rounded-lg hover:text-black transition-all hover:cursor-pointer"
                      onClick={() => handleCopy(file)}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          onClick={() => handleCopy(file)}
                          className="text-neutral-400 flex flex-row justify-end bg-neutral-100 p-1 rounded-lg hover:text-black transition-all hover:cursor-pointer"
                        >
                          <Expand className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>{file.name}</DialogTitle>
                        <div className="bg-neutral-100 rounded-xl relative w-full min-h-[300px] h-full flex flex-col justify-center items-center ">
                          {previewImage ? (
                            <Image
                              src={previewImage}
                              alt="Preview"
                              fill
                              className="rounded-md h-full w-full border"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <button
                      className="text-neutral-400 flex flex-row justify-end bg-neutral-100 p-1 rounded-lg hover:text-black transition-all hover:cursor-pointer"
                      onClick={() => handleDelete(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {fileDropError && (
          <p className="text-sm p-2 text-red-500">{fileDropError}</p>
        )}
      </div>
    </>
  );
}
