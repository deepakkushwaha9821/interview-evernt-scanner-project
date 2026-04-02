import { useEffect, useState } from "react";
import { API_BASE } from "../services/apiBase";

export default function AdminDashboard(){
  const [videos,setVideos] = useState([]);

  useEffect(()=>{

    fetch(`${API_BASE}/admin/videos`)
    .then(res=>res.json())
    .then(data=>setVideos(data))

  },[API_BASE])

  return(

    <div>

      <h1>Interview Sessions</h1>

      {videos.map(v => (

        <div key={v.session}>

          <h3>{v.session}</h3>

          <h4>Latest Stored Frame</h4>
          {v.latest_frame ? (
            <img
              src={`${API_BASE}/${v.latest_frame}`}
              alt={`Latest frame for ${v.session}`}
              style={{ width: "400px", borderRadius: "8px", display: "block" }}
            />
          ) : (
            <p>No frame stored yet.</p>
          )}

          <h4>Front View (Laptop)</h4>
          {v.laptop_video ? (
            <video width="400" controls>
              <source src={`${API_BASE}/${v.laptop_video}`} />
            </video>
          ) : (
            <p>No laptop video uploaded yet.</p>
          )}

          <h4>Side View (Mobile)</h4>
          {v.mobile_video || v.video ? (
            <video width="400" controls>
              <source src={`${API_BASE}/${v.mobile_video || v.video}`} />
            </video>
          ) : (
            <p>No mobile video uploaded yet.</p>
          )}

          <p>{v.description}</p>

        </div>

      ))}

    </div>

  );
}