export default function Loading() {
  return (
    <div className="space-y-5 sm:space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#F1F0F0]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-72 rounded-2xl bg-[#F1F0F0] xl:col-span-2" />
        <div className="h-72 rounded-2xl bg-[#F1F0F0]" />
      </div>
    </div>
  );
}
