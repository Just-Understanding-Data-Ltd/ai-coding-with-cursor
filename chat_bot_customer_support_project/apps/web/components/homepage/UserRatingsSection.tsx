import Image from "next/image";

export default function UserRatingsSection() {
  return (
    <section className="bg-gray-100 dark:bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="flex -space-x-2 mr-4">
              {[1, 2, 3].map((id) => (
                <Image
                  key={id}
                  src={`/testimonials/${id}.jpg`}
                  alt={`User ${id}`}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white dark:border-gray-800"
                />
              ))}
            </div>
            <div className="text-xl font-semibold">4874 makers ship faster</div>
          </div>
          <div className="flex items-center">
            <div className="text-yellow-400 text-2xl mr-2">★★★★★</div>
            <div className="text-xl font-semibold">4.9/5 rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
