import { API_BASE } from "./apiBase";

export async function sendFrame(pairCode, image){

  const res = await fetch(`${API_BASE}/proctor/mobile-frame`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      pairCode: pairCode,
      image: image
    })
  })

  return await res.json()

}