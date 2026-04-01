import { sendEvent } from "../proctoring/sendEvent";
export function sendEvent(event){

  fetch("http://localhost:8000/proctor/event",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(event)
  })

}