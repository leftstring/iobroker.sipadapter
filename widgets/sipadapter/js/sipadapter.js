"use strict";

console.log("start widget");

vis.binds.sipadapter = {
	version: "0.9.0",
    init: function (adapterInstance) {
		console.log("Start init method");
		vis.binds.sipadapter.adapterInstance = adapterInstance;
		
		if(!vis.editMode) {	
			console.log("set volume");
			var audioElement = document.getElementById("audioRemote");			
			audioElement.volume = 0.5;

			console.log("load sip account");
			vis.binds.sipadapter.sipAccount = new SIPWebRTCAccount();

			if (vis.binds.sipadapter.sipAccount.IsCorrectInitialized()) {
				vis.binds.sipadapter.initSIP();				
			} else if(!vis.binds.sipadapter.accountDialogFlag) {								
				vis.binds.sipadapter.requestSIPAccountData();
			}
			console.log("Passed init method");		
		}
	},
	initSIP: function() {
		console.log("setup sip communication");
		if(vis.binds.sipadapter.sipCommunication){
			console.log("reload for re-initialization");
			location.reload();
		}	
		try {
			var audioElement = document.getElementById("audioRemote");		
			vis.binds.sipadapter.sipCommunication = new SIPWebRTCCommunication(vis.binds.sipadapter.sipAccount, audioElement);
			console.log("sip communication ready");
			vis.binds.sipadapter.sipCommunication.onCallIncoming = vis.binds.sipadapter.onCallIncoming;
			vis.binds.sipadapter.sipCommunication.onCallTerminated = vis.binds.sipadapter.onCallTerminated;
			vis.binds.sipadapter.sipCommunication.onCallConnected = vis.binds.sipadapter.onCallConnected;
			console.log("sip event handlers added");		
		}
		catch(e) {
			console.error("sip communication failed");
			console.error(e);
		}	
	},
	onCallIncoming: function() {
		console.log("call incoming");
		var remoteFriendlyName = vis.binds.sipadapter.sipCommunication.getRemoteFriendlyName();
		document.getElementById("callFromLabel").innerText = "Eingehender Anruf von " + remoteFriendlyName;
		vis.binds.sipadapter.showContainer("incomingCallContainer");
	},
	onCallTerminated: function() {
		console.log("call terminated");
		vis.binds.sipadapter.showContainer("makeCallContainer");		
	},
	onCallConnected: function() {
		var remoteFriendlyName = vis.binds.sipadapter.sipCommunication.getRemoteFriendlyName();
		document.getElementById("inCallLabel").innerText = "In Anruf mit " + remoteFriendlyName;
		vis.binds.sipadapter.showContainer("inCallContainer");
	},
	makeCall: function() {
		console.log("make call");
		var telephoneNumberInput = document.getElementById("telephone-number-input");
		var telephoneNumber = telephoneNumberInput.value;
		vis.binds.sipadapter.sipCommunication.makeCall(telephoneNumber);
		document.getElementById("inCallLabel").innerText = "Anruf an " + telephoneNumber;
		vis.binds.sipadapter.showContainer("inCallContainer");
	},
	acceptCall: function() {
		console.log("accept call");
		vis.binds.sipadapter.sipCommunication.acceptCall();
	},
	declineCall: function() {
		console.log("decline call");
		vis.binds.sipadapter.sipCommunication.declineCall();
	},
	endCall: function() {
		console.log("end call");
		vis.binds.sipadapter.sipCommunication.endCall();
	},
	showContainer : function(container) {
		document.getElementById("makeCallContainer").classList.add("hidden");	
		document.getElementById("incomingCallContainer").classList.add("hidden");	
		document.getElementById("inCallContainer").classList.add("hidden");	
		document.getElementById(container).classList.remove("hidden");		
	},	
	volumeDown: function() {
		console.log("volume down");
		var audioElement = document.getElementById("audioRemote");
		var volumeSlider = document.getElementById("volume-slider");
		var volume = Math.max(audioElement.volume - 0.1, 0.1);
		audioElement.volume = volume;
		volumeSlider.value = volume;
	},
	volumeUp: function() {
		console.log("volume up");
		var audioElement = document.getElementById("audioRemote");
		var volumeSlider = document.getElementById("volume-slider");
		var volume = Math.min(audioElement.volume + 0.1, 1.0);;
		audioElement.volume = volume;
		volumeSlider.value = volume;
	},
	onVolumeChanged: function() {
		var audioElement = document.getElementById("audioRemote");
		var volumeSlider = document.getElementById("volume-slider");
		audioElement.volume = volumeSlider.value;
	},
	requestSIPAccountData: function () {
		console.log("request account data");	
		var accountDialog = document.getElementById("sipAccountDataDialog");				

		console.log("Open dialog for asterisk account data.")

		dialogPolyfill.registerDialog(accountDialog);

        var cancelButton = document.getElementById('cancel');
        var confirmButton = document.getElementById('confirm');

		if(!vis.binds.sipadapter.isAccountDialogInit) {
			cancelButton.addEventListener('click', function() {
				accountDialog.close();
			});
			confirmButton.addEventListener('click', function() {
				vis.binds.sipadapter.onAccountDataDialogSubmit();
				accountDialog.close();
			});
			vis.binds.sipadapter.isAccountDialogInit = true;
		}

		accountDialog.showModal();
	},	
    onAccountDataDialogSubmit(){
		console.log("onAccountDataDialogSubmit")
        const privateIdentityElement = document.getElementById("accountDataDialogPrivateIdentity");
        const publicIdentityElement = document.getElementById("accountDataDialogPublicIdentity");
        const passwordElement = document.getElementById("accountDataDialogPassword");
		const displayNameElement = document.getElementById("accountDataDialogDisplayName");
		const websocketProxyUrlElement = document.getElementById("accountDataDialogWebsocketProxyURL");
		const realmElement = document.getElementById("accountDataDialogRealm");

        const privateIdentity = privateIdentityElement.value;
        const publicIdentity = publicIdentityElement.value;
        const password = passwordElement.value;
		const displayName = displayNameElement.value;
		const websocket_proxy_url = websocketProxyUrlElement.value;
		const realm = realmElement.value;

		vis.binds.sipadapter.sipAccount.setAccountData(privateIdentity, publicIdentity, password, displayName, websocket_proxy_url, realm);

		vis.binds.sipadapter.initSIP();
	},
	configureAsteriskAccount: function() {
		console.log("configureAsteriskAccount")

		const privateIdentityElement = document.getElementById("accountDataDialogPrivateIdentity");
        const publicIdentityElement = document.getElementById("accountDataDialogPublicIdentity");
        const passwordElement = document.getElementById("accountDataDialogPassword");
		const displayNameElement = document.getElementById("accountDataDialogDisplayName");
		const websocketProxyUrlElement = document.getElementById("accountDataDialogWebsocketProxyURL");
		const realmElement = document.getElementById("accountDataDialogRealm");

		privateIdentityElement.value =  vis.binds.sipadapter.sipAccount.PrivateIdentity;
		publicIdentityElement.value =  vis.binds.sipadapter.sipAccount.PublicIdentity;
		passwordElement.value =  vis.binds.sipadapter.sipAccount.Password;
		displayNameElement.value =  vis.binds.sipadapter.sipAccount.DisplayName;
		websocketProxyUrlElement.value =  vis.binds.sipadapter.sipAccount.WebsocketProxyURL;
		realmElement.value =  vis.binds.sipadapter.sipAccount.Realm;

		vis.binds.sipadapter.requestSIPAccountData();
	}
};
