// components/TestUploader.js
export default function TestUploader({ onUploadComplete }) {
  return (
    <div className="mt-8">
      <label className="block text-sm font-medium text-gray-700">
        Upload your blank test
      </label>
      <div className="mt-1">
        <input
          type="file"
          onChange={(e) => onUploadComplete(e.target.files[0])}
          className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
}
