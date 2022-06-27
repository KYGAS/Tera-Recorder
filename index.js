const path = require('path'),
	  fs = require('fs'),
	  { protocol } = require('tera-data-parser');
	  
module.exports = function Logger(mod) {
	
	let start = 0;
	let enabled = false;
	const command = mod.command;
	let filepath = null;
	let file = null;
	
	let blacklisted = [
		''
	]
	
	// --- fake stuff
	let fakeGameId = 33344455566677789n;
	let fakeSpawn = null;
	// ---
	
	const separate = '\r\n';
	
	this.destructor = function()
	{
		if(enabled)
		{
			file.end('<---- Unexpected Recorder Ending ---->\r\n');
		}
	}
	
	command.add('recorder', () => {
		enabled = !enabled;
		command.message('Logging is now: ' + (enabled ? 'Enabled.' : 'Disabled.'));
		if(enabled)
		{
			//filepath = path.join(__dirname, '..', '..', 'Recording(' + Date.now() + ')' + '.log');
			filepath = path.join(__dirname, '..', '..', 'TeraReplay('+ Date.now() + ').txt');
			file = fs.createWriteStream(filepath, {highWaterMark: 1024*1024});
		}
		else
		{
			file.end('<---- Logging Ended ---->\r\n');
		}
	});
	
	
		mod.hook('*', 'raw', { order: +Infinity, filter: { fake : null} }, (code, data, fromServer, fake) => {
			 let packet=null;
				
			 let timestamp = Date.now() - start;
			 //if(blacklisted.includes(mod.dispatch.protocolMap.code.get(code) ) ) return;
			 if( convertToServer(code, data, timestamp) == 5 ) return;
				
				file.write(
							timestamp + ':'
						 );
				file.write(
							data.toString('hex'), (function(){
												})
						 );
				file.write(
							separate, (function(){
												})
						 );
		});
		
		
		function convertToServer(code, data, timestamp){
			let packet;
			let packetData;
			try{
				packet = mod.dispatch.fromRaw(code, '*', data)
			}catch(_){
				return;
			}
			switch( mod.dispatch.protocolMap.code.get(code) ){
				case 'C_PLAYER_LOCATION':
				    packetData = Object.assign( packet, { speed : 240, gameId : mod.game.me.gameId } )
					data = mod.dispatch.toRaw('S_USER_LOCATION', '*', packetData );
					break;
				case 'S_LOGIN':
					addFakePacket(code, data, timestamp)
				    packetData = Object.assign( packet, {  } )
					fakeSpawn = Object.assign( packetData, {})
					data = mod.dispatch.toRaw('S_SPAWN_USER', '*', packetData );
					break;
				case 'S_SPAWN_ME':
					addFakePacket(code, data, timestamp)
				    packetData = Object.assign( fakeSpawn, packet )
					data = mod.dispatch.toRaw('S_SPAWN_USER', '*', packetData );
					break;
				case 'I_TELEPORT':
				    packetData = Object.assign( packet, { gameId : fakeGameId } )
					data = mod.dispatch.toRaw('S_INSTANT_MOVE', '*', packetData );
					break;
				case 'C_VEHICLEEX_LOCATION':
				    packetData = Object.assign( packet, { speed : 240, gameId : mod.game.me.gameId } )
					data = mod.dispatch.toRaw('S_USER_LOCATION', '*', packetData );
					break;
				case 'C_NOTIFY_LOCATION_IN_ACTION':
				    packetData = Object.assign( packet, { speed : 240, gameId : mod.game.me.gameId } )
					data = mod.dispatch.toRaw('S_USER_LOCATION_IN_ACTION', '*', packetData );
					break;
				case 'C_NOTIFY_LOCATION_IN_DASH':
				    packetData = Object.assign( packet, { speed : 240, gameId : mod.game.me.gameId } )
					data = mod.dispatch.toRaw('S_USER_LOCATION_IN_ACTION', '*', packetData );
					break;
				case 'C_NOTIFY_LOCATION_IN_REACTION':
				    packetData = Object.assign( packet, { speed : 240, gameId : mod.game.me.gameId } )
					data = mod.dispatch.toRaw('S_USER_LOCATION_IN_ACTION', '*', packetData );
					break;
				case 'C_PLAYER_FLYING_LOCATION':
				    packetData = Object.assign( packet, { speed : 240, gameId : mod.game.me.gameId } )
					data = mod.dispatch.toRaw('S_USER_LOCATION', '*', packetData );
					break;
				default:
					return 0
			}
			
			file.write(
						timestamp + ':'
					 );
			file.write(
						data.toString('hex'), (function(){
											})
					 );
			file.write(
						separate, (function(){
											})
					 );
			return 5;
		}
		
		function addFakePacket(code, data, timestamp){
			let packet;
			let packetData;
			try{
				packet = mod.dispatch.fromRaw(code, '*', data)
			}catch(_){
				return;
			}
			switch( mod.dispatch.protocolMap.code.get(code) ){
				case 'S_LOGIN':
				    packetData = Object.assign( packet, { gameId : fakeGameId } )
					data = mod.dispatch.toRaw('S_LOGIN', '*', packetData );
					break;
				case 'S_SPAWN_ME':
				    packetData = Object.assign( packet, { gameId : fakeGameId } )
					timestamp += 1500 // avoid unloaded zones on different load times | can be fixed by having replayer hook C_FIN
					data = mod.dispatch.toRaw('S_SPAWN_ME', '*', packetData );
					break;
				case '':
					break;
				case '':
					break;
				case '':
					break;
				case '':
					break;
				case '':
					break;
				case '':
					break;
				case '':
					break;
				default:
					return
			}
			
			file.write(
						timestamp + ':'
					 );
			file.write(
						data.toString('hex'), (function(){
											})
					 );
			file.write(
						separate, (function(){
											})
					 );
			return 5;
		}
		
		start = Date.now();
		command.exec('recorder')
		
}