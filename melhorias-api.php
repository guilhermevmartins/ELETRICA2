<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
session_start(['cookie_httponly'=>true,'cookie_samesite'=>'Strict','cookie_secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','use_strict_mode'=>true]);
function answer(array $data,int $status=200):never{http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE);exit;}
function errorReply(string $message,int $status=400):never{answer(['error'=>$message],$status);}
$dir=__DIR__.'/config';$prefix="<?php exit; ?>\n";$file=$dir.'/improvements-data.php';
$_SESSION['improvements_csrf']??=bin2hex(random_bytes(24));$admin=($_SESSION['improvements_admin']??0)>time();
$method=$_SERVER['REQUEST_METHOD'];$input=[];
if($method==='POST'){
 $raw=file_get_contents('php://input',false,null,0,12001);if(strlen($raw)>12000)errorReply('Texto muito grande.',413);
 $input=json_decode($raw,true);if(!is_array($input))errorReply('Pedido inválido.');
 if(!hash_equals($_SESSION['improvements_csrf'],(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'')))errorReply('Atualize a página para continuar.',403);
 $action=$input['action']??'';
 if(!in_array($action,['submit','login','logout','status'],true))errorReply('Ação inválida.');
 if($action==='logout'){unset($_SESSION['improvements_admin']);answer(['admin'=>false]);}
 if($action==='status'&&!$admin)errorReply('Somente o desenvolvedor pode alterar o histórico.',403);
 if(in_array($action,['login','submit'],true)){
  $rate=fopen($dir.'/improvements-rate.php','c+');if(!$rate||!flock($rate,LOCK_EX))errorReply('Serviço indisponível.',503);
  $saved=stream_get_contents($rate);$rates=$saved?json_decode(substr($saved,strlen($prefix)),true):[];if(!is_array($rates))errorReply('Serviço indisponível.',503);
  $rates=array_filter($rates,fn($r)=>$r['until']>time());$key=hash('sha256',($_SERVER['REMOTE_ADDR']??'local').$action);$r=$rates[$key]??['count'=>0,'until'=>time()+900];
  if($r['count']>=($action==='login'?10:20))errorReply('Limite temporário atingido. Tente novamente em 15 minutos.',429);
  $r['count']++;$rates[$key]=$r;rewind($rate);ftruncate($rate,0);fwrite($rate,$prefix.json_encode($rates));fflush($rate);flock($rate,LOCK_UN);fclose($rate);
 }
 if($action==='login'){
  $config=require $dir.'/improvements.php';if(!is_string($input['password']??null)||!password_verify($input['password'],$config['password_hash']))errorReply('Senha incorreta.',401);
  session_regenerate_id(true);$_SESSION['improvements_admin']=time()+7200;answer(['admin'=>true]);
 }
}elseif($method!=='GET')errorReply('Método não permitido.',405);
$lock=fopen($dir.'/improvements.lock','c+');if(!$lock||!flock($lock,$method==='GET'?LOCK_SH:LOCK_EX))errorReply('Histórico indisponível.',503);
$items=[];if(is_file($file)){$raw=file_get_contents($file);if($raw===false||!str_starts_with($raw,$prefix))errorReply('Dados preservados. Histórico indisponível.',503);$items=json_decode(substr($raw,strlen($prefix)),true);if(!is_array($items))errorReply('Histórico inválido. Dados preservados.',503);}
if($method==='GET')answer(['items'=>array_reverse($items),'admin'=>$admin,'csrf'=>$_SESSION['improvements_csrf']]);
if($action==='submit'){
 $title=$input['title']??'';$description=$input['description']??'';
 if(!is_string($title)||!is_string($description)||trim($title)===''||trim($description)===''||strlen($title)>360||strlen($description)>6000)errorReply('Preencha o título e a descrição dentro dos limites.');
 if(count($items)>=3000)errorReply('O histórico atingiu o limite de sugestões.',409);
 $items[]=['id'=>bin2hex(random_bytes(12)),'title'=>trim($title),'description'=>trim($description),'done'=>false,'created'=>gmdate('c'),'revision'=>bin2hex(random_bytes(8)),'history'=>[]];
}else{
 $index=null;foreach($items as $i=>$item)if($item['id']===($input['id']??null)){$index=$i;break;}
 if($index===null)errorReply('Sugestão não encontrada.',404);
 if(($input['revision']??null)!==$items[$index]['revision'])errorReply('Esta sugestão mudou. Atualize o histórico.',409);
 if(!is_bool($input['done']??null))errorReply('Estado inválido.');
 if($items[$index]['done']!==$input['done']){$items[$index]['done']=$input['done'];$items[$index]['history'][]=['done'=>$input['done'],'date'=>gmdate('c')];$items[$index]['revision']=bin2hex(random_bytes(8));}
}
$temp=tempnam($dir,'improvement-');$data=$prefix.json_encode($items,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
if($temp===false||file_put_contents($temp,$data)!==strlen($data)||!rename($temp,$file)){if($temp&&is_file($temp))unlink($temp);errorReply('Não foi possível salvar. Tente novamente.',503);}
answer(['ok'=>true]);
