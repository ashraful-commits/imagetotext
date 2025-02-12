import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Clipboard, CheckCircle } from "lucide-react";

export default function ImageToText() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const languages = "eng+ben"; // English & Bengali only

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file));
      setText(""); // Reset extracted text
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file));
      setText("");
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            setImage(URL.createObjectURL(file));
            setText("");
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const extractText = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const { data } = await Tesseract.recognize(image, languages, {
        logger: (m) => console.log(m), // Optionally log progress
      });
      setText(data.text.trim());
    } catch (error) {
      console.error("Error extracting text:", error);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className=" w-full h-full bg-gray-50">
      <div className="w-full h-full p-6 shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Image to Text (Bengali & English)
        </h1>
       <div className="flex justify-between">

        <div className="flex w-[50%] justify-center">
          
    
          {image ? <div className="mb-6 text-center ml-6">
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <h2 className="font-semibold text-lg">Uploaded Image:</h2>
              <img
                src={image}
                alt="Uploaded"
                className="max-h-48 mx-auto rounded-lg shadow mt-2"
              />
            </div>
          </div> :<div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-6 ${
              isDragging ? "border-blue-500 bg-blue-100" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="text-gray-600">Drag & drop an image here</p>
            <label htmlFor="ids" className="text-sm text-gray-500">or click to upload</label>
            <input
              type="file"
              id="ids" 
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>}
        </div>
        <div className="bg-gray-100 w-[50%] rounded-lg  ">
          <div className="flex gap-5">
          <h2 className="text-lg font-semibold text-gray-900">Extracted Text:</h2>  <button
            onClick={copyToClipboard}
            className=" bg-gray-300 p-1 rounded-full hover:bg-gray-400"
          >
            {copied ? <CheckCircle size={10} color="green" /> : <Clipboard size={10} />}
          </button>
          </div>
          <textarea
            value={text}
          
           rows={10}
            className="w-full text-gray-900 p-2 mt-2 bg-white border rounded-lg "
          />
         
        </div>
       </div>
    
        <button
          onClick={extractText}
          className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Extracting..." : "Extract Text"}
        </button>
    
       
      </div>
    </div>
  );
}
