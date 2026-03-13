import { NextResponse } from "next/server";

export async function GET(){
    console.log("working")
    return NextResponse.json({message: "working"})
}