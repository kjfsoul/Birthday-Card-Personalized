export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-2xl">✨</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Creating your message...</h3>
        <p className="text-gray-600">This will take just a moment ✨</p>
      </div>
    </div>
  );
}
