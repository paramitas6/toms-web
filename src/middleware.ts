import { NextRequest, NextResponse } from "next/server";
import { isValidPassword } from "./lib/isValidPassoword";

export async function middleware(req: NextRequest) {
        if(await isAuthenticated(req)===false){
                return new NextResponse("Unauthorized", { status: 401,headers:{"WWW-Authenticate":"Basic"} });
        }
    // Add middleware logic here


}  


async function isAuthenticated(req: NextRequest) {

    const authHeader = req.headers.get("authorization")||req.headers.get("Authorization")

    if (authHeader===null) return false

    const [username,password]=Buffer.from(authHeader.split(" ")[1],"base64").toString().split(":")

    return(username===process.env.ADMIN_USERNAME&&(await isValidPassword(password,process.env.HASHED_ADMIN_PASSWORD as string)))

  // authentication logic

}

export const config={
    matcher: "/admin/:path*"
}