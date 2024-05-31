
import Link from "next/link";
import { Nav, NavLink } from "./Nav";
import Image from "next/image";
import {Moon, ShoppingCart, User} from "lucide-react";
import logob from "/public/logob.png";


export default function CustomerNav(){


return(<>
      <div className="bg-red-100 flex flex-col items-center py-1 text-black text-sm font-light  font-montserrat">
        <p>Come visit us! </p>

        <p>572 Eglinton Avenue West</p>
        <p>(647)352-9188</p>
      </div>


      <div className={`flex justify-between items-center py-2 bg-black `}>
        <div className={`w-1/3 text-center font-kuhlenbach text-2xl border-secondary 'text-white'}`}>
          <Nav lightmode={false}>
            {/* <NavLink href="/"> Home</NavLink> */}
            <NavLink href="/arrangements">Shop</NavLink>
            <NavLink href="/subscriptions">Subscriptions</NavLink>
            <NavLink href="/subscriptions">About</NavLink>
          </Nav>
        </div>

        <div className="w-1/3 flex justify-center">
          <Link href="/">
            <Image src={logob}  alt="Tom's Logo" width={300} />
          </Link>
        </div>

        <div className="w-1/3 flex space-x-3 justify-end pr-20">
          <Moon color={ "white"} />
          <User color={"white"}/>
          <ShoppingCart color={"white"}/>
        </div>
      </div>
</>)


}



// 'use client'
// import Link from "next/link";
// import { Nav, NavLink } from "./Nav";
// import Image from "next/image";
// import {Moon, ShoppingCart, User} from "lucide-react";
// import logob from "/public/logob.png";
// import logow from "/public/logow.png";
// import { useState } from "react";


// export default function CustomerNav(){

//     const [lightmode, setLightmode] = useState(false);
// return(<>
//       <div className="bg-red-100 flex flex-col items-center py-1 text-black text-sm font-light  font-montserrat">
//         <p>Come visit us! </p>

//         <p>572 Eglinton Avenue West</p>
//         <p>(647)352-9188</p>
//       </div>


//       <div className={`flex justify-between items-center py-2 ${lightmode ? 'bg-white border border-grey-500' : 'bg-black '}`}>
//         <div className={`w-1/3 text-center font-kuhlenbach text-2xl border-secondary ${lightmode ? 'text-black bg-white' : 'text-white'}`}>
//           <Nav lightmode={lightmode}>
//             {/* <NavLink href="/"> Home</NavLink> */}
//             <NavLink href="/arrangements">Shop</NavLink>
//             <NavLink href="/subscriptions">Subscriptions</NavLink>
//             <NavLink href="/subscriptions">About</NavLink>
//           </Nav>
//         </div>

//         <div className="w-1/3 flex justify-center">
//           <Link href="/">
//             <Image src={lightmode ? logow : logob}  alt="Tom's Logo" width={300} />
//           </Link>
//         </div>

//         <div className="w-1/3 flex space-x-3 justify-end pr-20">
//           <Moon onClick={()=> setLightmode(prevLightmode => !prevLightmode)} color={lightmode ? "black" : "white"} />
//           <User color={lightmode ? "black" : "white"}/>
//           <ShoppingCart color={lightmode ? "black" : "white"}/>
//         </div>
//       </div>
// </>)


// }