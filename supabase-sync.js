const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
window.remoteEnabled=true;

async function initializeRemoteData(){
  const {data:row,error}=await supabaseClient.from("league_state").select("data").eq("id","main").single();
  if(error){console.error("No se pudieron cargar los datos online",error);return}
  if(row?.data&&Object.keys(row.data).length){localStorage.setItem(STORAGE_KEY,JSON.stringify(row.data));data=loadData();render();navigate(location.hash.slice(1)||"inicio")}
}
async function remoteLogin(password){
  const {data:authData,error}=await supabaseClient.auth.signInWithPassword({email:ADMIN_EMAIL,password});
  if(error)throw error;
  return authData.user;
}
async function remoteSignup(password){
  const {data:authData,error}=await supabaseClient.auth.signUp({email:ADMIN_EMAIL,password,options:{emailRedirectTo:location.origin+location.pathname}});
  if(error)throw error;
  return authData;
}
async function remoteSave(){
  const {data:sessionData}=await supabaseClient.auth.getSession();
  if(!sessionData.session)throw new Error("La sesión ha caducado. Vuelve a entrar como administrador.");
  const {error}=await supabaseClient.from("league_state").update({data,updated_at:new Date().toISOString(),updated_by:sessionData.session.user.id}).eq("id","main");
  if(error)throw error;
}
async function uploadLeagueAsset(file,folder){
  const safeName=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
  const path=`${folder}/${Date.now()}-${safeName}`;
  const {error}=await supabaseClient.storage.from("league-assets").upload(path,file,{cacheControl:"3600",upsert:false});
  if(error)throw error;
  return supabaseClient.storage.from("league-assets").getPublicUrl(path).data.publicUrl;
}
async function remoteChangePassword(password){const {error}=await supabaseClient.auth.updateUser({password});if(error)throw error}

document.getElementById("createAdminAccount").addEventListener("click",async()=>{
  const password=document.getElementById("password").value;
  const errorBox=document.getElementById("loginError");
  if(password.length<8){errorBox.textContent="Elige una contraseña de al menos 8 caracteres.";return}
  try{await remoteSignup(password);errorBox.style.color="#25823a";errorBox.textContent="Cuenta creada. Revisa tu correo y confirma el enlace antes de entrar."}catch(error){errorBox.style.color="";errorBox.textContent=error.message}
});

initializeRemoteData();
