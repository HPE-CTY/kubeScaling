
const Navbar = () => {

  return (
    <nav className="fixed top-0 w-full z-20 text-center md:text-left border-b border-gray-400/20 bg-gray-600 bg-opacity-5 backdrop-blur-lg backdrop-filter p-3 flex justify-between items-center drop-shadow-xl px-4">
        <h1 className="md:px-12 font-bold text-2xl md:text-4xl text-black dark:text-white flex flex-row justify-between items-center gap-2 md:gap-4">
          <img src="/logo.png" alt="HPE" className="w-28" />
          </h1>
          <div className="flex flex-row gap-20 justify-center items-center">
            <div className="hidden lg:flex flex-row gap-6">
          <ul className="flex flex-row gap-12 text-lg font-semibold">
           
           
          </ul>
          </div>
          <div className="flex flex-row gap-4 items-center">
          </div> 
          </div>
    </nav>
  )
}

export default Navbar