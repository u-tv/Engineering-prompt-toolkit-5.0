// 3D Cone Live Users Counter – Fake but realistic
(function() {
  const minUsers = 10000;
  const maxUsers = 25000;
  let currentUsers = Math.floor(Math.random() * (maxUsers - minUsers + 1) + minUsers);
  
  function updateCounter() {
    // Slight random fluctuation to look real
    const delta = Math.floor(Math.random() * 201) - 100; // -100 to +100
    let newVal = currentUsers + delta;
    if (newVal < minUsers) newVal = minUsers;
    if (newVal > maxUsers) newVal = maxUsers;
    currentUsers = newVal;
    document.getElementById('liveUserCount').innerText = currentUsers.toLocaleString();
  }
  
  // Create 3D cone container if not exists
  if (!document.getElementById('liveUserCone')) {
    const coneDiv = document.createElement('div');
    coneDiv.id = 'liveUserCone';
    coneDiv.style.position = 'fixed';
    coneDiv.style.bottom = '20px';
    coneDiv.style.right = '20px';
    coneDiv.style.zIndex = '9999';
    coneDiv.style.width = '180px';
    coneDiv.style.height = '180px';
    coneDiv.style.perspective = '500px';
    coneDiv.style.cursor = 'pointer';
    coneDiv.innerHTML = `
      <div style="width:100%;height:100%;transform-style:preserve-3d;animation:spinCone 8s infinite linear;">
        <div style="position:absolute;width:100%;height:100%;background:radial-gradient(circle at 30% 30%, #ffcc00, #ff6600);border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;transform:rotateX(45deg);box-shadow:0 0 30px rgba(255,100,0,0.8);display:flex;align-items:center;justify-content:center;flex-direction:column;">
          <div style="font-size:28px;font-weight:bold;color:#fff;text-shadow:0 0 5px black;">👥</div>
          <div id="liveUserCount" style="font-size:24px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.5);padding:4px 12px;border-radius:30px;margin-top:10px;">${currentUsers.toLocaleString()}</div>
          <div style="font-size:12px;color:#fff;margin-top:5px;">LIVE NOW</div>
        </div>
      </div>
      <style>
        @keyframes spinCone {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          100% { transform: rotateY(360deg) rotateX(10deg); }
        }
      </style>
    `;
    document.body.appendChild(coneDiv);
    // Update every 10 seconds
    setInterval(updateCounter, 10000);
  }
})();
