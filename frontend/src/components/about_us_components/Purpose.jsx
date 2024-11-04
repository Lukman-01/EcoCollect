import handInAboutPage from './../../assets/handInAboutPage.png';

const Purpose = () => {
  return (
    <div className="mx-auto w-[900px] py-16 px-4 lg:px-0">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="lg:w-1/2">
          <h3 className="mt-5">
            <span className="bg-[#005232] p-3 rounded-md text-white text-2xl">
              Purpose & Values
            </span>
          </h3>
        
          <div className="mt-8 space-y-6">
            <ol className="list-none">
              <li className="mb-4">
                <span className="text-[#005232] text-lg font-semibold">
                  Environmental Stewardship:
                </span>
                <p className="mt-1 text-gray-700">
                  We are committed to protecting our planet and conserving its resources.
                  By promoting recycling and reducing waste, we aim to minimize our
                  ecological footprint and contribute to a sustainable future.
                </p>
              </li>
              <li className="mb-4">
                <span className="text-[#005232] text-lg font-semibold">
                  Innovation:
                </span>
                <p className="mt-1 text-gray-700">
                  We embrace innovation as a driving force behind our operations. By
                  leveraging advanced technologies, we continuously seek new and efficient
                  ways to enhance the recycling process and make it more accessible to everyone.
                </p>
              </li>
              <li className="mb-4">
                <span className="text-[#005232] text-lg font-semibold">
                  Community Focus:
                </span>
                <p className="mt-1 text-gray-700">
                  We believe in the power of communities to create lasting change. Through
                  collaboration and engagement, we strive to build a strong network of
                  individuals and organizations dedicated to recycling and environmental
                  preservation.
                </p>
              </li>
            </ol>
          </div>
        </div>

        <div className="lg:w-1/2 flex justify-center lg:justify-end">
          <img src={handInAboutPage} className="h-[380px] w-[300px] rounded-lg shadow-lg" alt="Hand holding plant in About Page" />
        </div>
      </div>
    </div>
  );
};

export default Purpose;
