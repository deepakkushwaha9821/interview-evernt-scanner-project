import { API_BASE } from "../services/apiBase";

export function sendEvent(event){

  fetch(`${API_BASE}/proctor/event`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(event)
  })

}