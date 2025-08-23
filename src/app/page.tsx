export default function Home() {
  return (
    <div className="min-h-screen bg-[#191919] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          <span className="text-blue-500">p</span>icoco
        </h1>
        <div className="space-y-4">
          <a 
            href="/main" 
            className="block px-6 py-3 bg-white bg-opacity-25 text-white rounded-full hover:bg-opacity-40 transition-all"
          >
            메인 페이지로 이동
          </a>
        </div>
      </div>
    </div>
  );
}