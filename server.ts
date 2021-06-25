import * as dotenv from 'dotenv';
dotenv.config();
const express = require('express');
//import * as express from 'express';
import * as bodyParser from 'body-parser';
const app = express();

//import * as slpjs from 'slpjs';
// import { SlpFaucetHandler } from './slpfaucet';
import BigNumber from 'bignumber.js';

// FULLSTACK.cash replacing BITBOX

// Set NETWORK to either testnet or mainnet
const NETWORK = 'mainnet'
// bch-js-examples require code from the main bch-js repo
const BCHJS = require('@psf/bch-js')
// REST API SERVERS
const BCHN_MAINNET = 'https://bchn.fullstack.cash/v4/'
// const ABC_MAINNET = 'https://abc.fullstack.cash/v4/'
const TESTNET3 = 'https://testnet3.fullstack.cash/v4/'


let bchjs = new BCHJS({ restURL: BCHN_MAINNET });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// let slpFaucet = new SlpFaucetHandler(process.env.MNEMONIC!);

const faucetQty = parseInt(process.env.TOKENQTY!);
const tokenID = process.env.TOKENID;


let users = new Array();
let spamArray = new Array();
let addressArray = new Array();
let spamAddresses = new Array();

function clearFunc() {
	console.log('clearing the users and address arrays, its been 12 hours');
	users = [];
	addressArray = [];

}


//setInterval(clearCookies, 5000);
// 43200000
// interval to run clearFunc every 12 hours in milliseconds
setInterval(clearFunc, 43200000);


function clearDistributedAmnt(){
	totalDistAmnt = Number(0);
}

// interval to run clearFunc every 2 hours in milliseconds
setInterval(clearDistributedAmnt, 7200000);

function removeFromArray(userIP, address){
			//error, remove userIP & address from arrays.
          const indexIP = users.indexOf(userIP);
          const indexAd = addressArray.indexOf(address);
          if (indexIP > -1) {
            users.splice(indexIP, 1);
          }
          if (indexAd > -1) {
          	addressArray.splice(indexAd, 1);
          }
}

let totalDistAmnt = Number(0); 

function addDistAmnt(amount) {

	totalDistAmnt = totalDistAmnt + amount;
	console.log('Just added ' + amount + ' to Total. The total distributed amount in last 2 hours is now ' + totalDistAmnt);

	return totalDistAmnt;
	

}


let errorMsg = 'You may only claim from the faucet once per 12 hours. Check back soon!';

//permanently block spam users on each restart
//spamArray.push('176.113.74.202');
//spamArray.push('185.65.134.165');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//csurf cookie thangs
//var csrf = require('csurf')
const cookieParser = require('cookie-parser');
//var csrfProtection = csrf({ cookie: true })

// const csrfMiddleware = csurf({
//   cookie: true
// });

//JSON object to be added to cookie 
const sour_cookie = 'dacookie-623$^2345234sadnfdKNFDSL:k3h48942000000'

app.use(cookieParser());
//app.use(csrfMiddleware);

let captcha = { 
	0 : 'What is 2 + two?',
	1 : 'What is four + 4?',
	2 : 'What is 4 + five?',
	3 : 'What is five + 8?',
	4 : 'what is nineteen minus 9?',
}

//get request from user, return index page with null vals & captcha
app.get('/', function (req, res) {
	// generate random index for captcha questions
	let index = Math.round(Math.random() * 10);
	if (index > 5){
		index = index - 5;
	}


	res.render('index', { txid: null, error: null, randomNumber: null, captcha: captcha[index]});
})

// cookie testing

//, csrfToken: req.csrfToken()
//req.body.csrfToken()
//req.body._csrf

// app.get('/cookie', function (req, res) {
// 	console.log('COOKIES: ', req.cookies);
// 	res.send(req.cookies);
// })

// app.get('/add', function (req, res) {
// 	res.cookie('SOUR_Faucet', sour_cookie, { maxAge: 5000, httpOnly: true });
// 	res.send('SOUR cookie added');
// 	//var expiryDate = new Date(Number(new Date()) + 10000); 
// })

// REMOVE! 
// app.get('/clearcookies', function (req, res) {
// 	res.clearCookie('SOUR_Faucet');
// 	res.send('SOUR cookie removed');
// })


app.post('/', async function (req, res) {

	let index = Math.round(Math.random() * 10);
	if (index > 5){
		index = index - 5;
	}

	let honeypot = req.body.honeypot;

	const isSpamSubmission = honeypot === undefined 
        || honeypot.length;

    // Grab and print date/time and IP of user upon form submission/post
	let submitDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	let userIP = req.ip;
	userIP  = userIP.substring(7, userIP.length);
	let userIPsub  = userIP.substring(0, 8);
	let address = req.body.address.trim();

	console.log('-----------------------------------------------------------------------------------');
	console.log('IP', userIP);
	console.log('DATE', submitDate);
	console.log('SUBMISSION: ', address);
	console.log('honeypot ', honeypot);
	
	if (isSpamSubmission) {
			console.log('ITS A BOT - DENY & GIVE GENERIC ERROR');
			res.render('index', { txid: null, error: 'Captcha is incorrect. Check it and resubmit', randomNumber: null, captcha: captcha[index]});
			return;
	}

	let captchaQuestion = req.body.captchaQuestion;
	let captchaAnswer = req.body.captcha.trim().toUpperCase();

	console.log('captchaQuestion', captchaQuestion);
	console.log('captchaAnswer', captchaAnswer);

	if(captchaAnswer){

	switch(captchaQuestion) {
  		case captcha[0]:
  		if ( (captchaAnswer !== '4') && (captchaAnswer !== 'FOUR') ){
			console.log('incorrect captcha');
			res.render('index', { txid: null, error: 'Captcha is incorrect. Check it and resubmit', randomNumber: null, captcha: captcha[index]});
			return;
  		}
    // code block
    	break;

    	case captcha[1]:
  		if ( (captchaAnswer !== '8') && (captchaAnswer !== 'EIGHT') ){
			console.log('incorrect captcha');
			res.render('index', { txid: null, error: 'Captcha is incorrect. Check it and resubmit', randomNumber: null, captcha: captcha[index]});
			return;
  		}
    // code block
    	break;
  		
  		case captcha[2]:
    	// code block
    	 if ( (captchaAnswer !== '9') && (captchaAnswer !== 'NINE') ){
			console.log('incorrect captcha');
			res.render('index', { txid: null, error: 'Captcha is incorrect. Check it and resubmit', randomNumber: null, captcha: captcha[index]});
			return;
  		 }
    	break;
  		
  		case captcha[3]:
  		 if ( (captchaAnswer !== '13') && (captchaAnswer !== 'THIRTEEN') ){
			console.log('incorrect captcha');
			res.render('index', { txid: null, error: 'Captcha is incorrect. Check it and resubmit', randomNumber: null, captcha: captcha[index]});
			return;
  		 }
  		 break;

  		case captcha[4]:
  		  if ( (captchaAnswer !== '10') && (captchaAnswer !== 'TEN') ){
			console.log('incorrect captcha');
			res.render('index', { txid: null, error: 'Captcha is incorrect. Check it and resubmit', randomNumber: null, captcha: captcha[index]});
			return;
  		}
  		break;

  		default:
  			console.log('incorrect captcha');
			res.render('index', { txid: null, error: 'Captcha is incorrect. Check it and resubmit', randomNumber: null, captcha: captcha[index]});
			return;
	}

	}else{
		console.log('blank captcha');
		res.render('index', { txid: null, error: 'Captcha is blank. Check it and resubmit', randomNumber: null, captcha: captcha[index]});
		return;
	}

	// COOKIES !
	let reqCookies = [];

	if(req.cookies['SOUR_Faucet']){
		console.log('SOUR_Faucet COOKIES FOUND. THROWING ERROR.', req.cookies['SOUR_Faucet']);
		res.render('index', { txid: null, error: errorMsg, randomNumber: null, captcha: captcha[index]});
		return;
	}


	if ( (spamArray.indexOf(userIP) != -1) ) {
			console.log('User is SPAMMER ADDRESS, sending back error message');
			res.render('index', { txid: null, error: errorMsg, randomNumber: null, captcha: captcha[index]});
			return;
		}

	if (spamAddresses.indexOf(address) != -1) {
			console.log('User is using SPAM ADDRESS, sending back error message ;)');
			res.render('index', { txid: null, error: errorMsg, randomNumber: null, captcha: captcha[index]});
			return;
		}


		// USER IP ARRAY
	if(users.indexOf(userIP) != -1) {
		console.log('User IP already submitted form in last 12 hours, sending back error message');
		res.render('index', { txid: null, error: errorMsg, randomNumber: null, captcha: captcha[index]});
		return;
	}else{
		users.push(userIP);
	}


	// ADDRESS ARRAY
	if(addressArray.indexOf(address) != -1){
		console.log('User is submitting with an address that has already been used in the last 12 hours.');
        res.render('index', { txid: null, error: errorMsg, randomNumber: null, captcha: captcha[index]});
        return;
	}else{
		addressArray.push(address);
	}

	if ( address.length < 55 ){
		removeFromArray(userIP, address);
		res.render('index', { txid: null, error: 'Please enter your SLP address with the simpleledger: prefix', randomNumber: null, captcha: captcha[index] });
		return;
	}

	if (totalDistAmnt > 250){
		console.log('totalAmntDistributed MAX for the last 2 hours has been reached at ' + totalDistAmnt);
		removeFromArray(userIP, address);
		res.render('index', { txid: null, error: 'Faucet is temporarily empty :(', randomNumber: null, captcha: captcha[index] });
		return;
	}

	// if(address === process.env.DISTRIBUTE_SECRET!) {
	// 	res.render('index', { txid: null, error: "Token distribution instantiated, please wait 30 seconds..." , randomNumber: null, captcha: captcha[index] });

	// 	await slpFaucet.evenlyDistributeTokens(process.env.TOKENID!);
	// 	await sleep(5000);
	// 	await slpFaucet.evenlyDistributeBch();
	// 	slpFaucet.currentFaucetAddressIndex = 0;
	// 	return;
	// }

	try {
		if(!bchjs.SLP.Address.isSLPAddress(address)) {
			//error, remove userIP & address from arrays.
			//console.log(users);
			//console.log(addressArray);
			removeFromArray(userIP, address);
			//console.log(users);
			//console.log(addressArray);
			res.render('index', { txid: null, error: "Not a SLP Address.", randomNumber: null, captcha: captcha[index] });
			return;
		}
	} catch(error) {
		//error, remove userIP & address from arrays.
          removeFromArray(userIP, address);
		res.render('index', { txid: null, error: "Not a SLP Address.", randomNumber: null, captcha: captcha[index] });
		return;
	}

	// let changeAddr: { address: string, balance: slpjs.SlpBalancesResult };
	// try {
	// 	changeAddr = await slpFaucet.selectFaucetAddressForTokens(process.env.TOKENID!);
	// } catch(error) {
	// 	//error, remove userIP & address from arrays.
 //          removeFromArray(userIP, address);

	// 	res.render('index', { txid: null, error: "Faucet is temporarily empty :(", randomNumber: null, captcha: captcha[index] });
	// 	return;
	// }

	// generate random number for amount to give to each user
	// this will generate a number between 0 & 99
	let random = Math.random() * 100;
	//console.log(random);
	
	// MAX STARTED AT 100. If over 50, lets subtract 50 (remove this if you want it to be up to 99)
	if(random > 50){
		random = random - 50;
	}
	
	//console.log(random);
	
	// convert to slptoshis for faucet. Edit as needed for different token decimal points. Treating it as satoshis (100,000,000)
	random = Math.round(random * 100000000);
	//fix decimals
	let randomNum = random.toFixed(8);
	//console.log(tokenQty);
	//convert to string
	const faucetQty = String(randomNum);
	console.log('RANDOM NUMBER', randomNum);

	// send variables
	// mnemonic - process.env.mnemonic
	// faucetQty - amount to send (random)
	// tokenID - process.env.TOKENID
	// wip
	// change address
	const MNEMONIC = process.env.MNEMONIC;
	let TO_SLPADDR = address; // user entered address. by this point, it's been verified
	const TOKENQTY = faucetQty; // amount to send (random)
	const TOKENID = tokenID;

	console.log('MNEMONIC - ' + MNEMONIC);

	// ACTUAL SEND
	let sendTxId: string;
	try {
		// let inputs: slpjs.SlpAddressUtxoResult[] = [];
		// inputs = inputs.concat(changeAddr.balance.slpTokenUtxos[process.env.TOKENID!]).concat(changeAddr.balance.nonSlpUtxos)
		// inputs.map(i => i.wif = slpFaucet.wifs[changeAddr.address]);
		// TODO: replace this send with fullstack.cash send
	
	//	sendTxId = await slpFaucet.network.simpleTokenSend(process.env.TOKENID!, new BigNumber(faucetQty), inputs, address, changeAddr.address);

	// START FULLSTACK.CASH SEND 

	// WIF ONLY METHOD (only linked to the single address' WIF private key)
	// const WIF = process.env.WIF;
	// console.log('WIF - ' + WIF);

 // let keyPair = bchjs.ECPair.fromWIF(WIF);
	
	// const cashAddress = bchjs.ECPair.toCashAddress(keyPair);
 // // bchjs.HDNode.toCashAddress(change)

 	// console.log(cashAddress);
 // // should be bitcoincash:qqs74sypnfjzkxeq0ltqnt76v5za02amfgg7frk99g

 // const slpAddress = bchjs.SLP.Address.toSLPAddress(cashAddress);

 // console.log(slpAddress);
 // // should be simpleledger:qqs74sypnfjzkxeq0ltqnt76v5za02amfgy9zcr9mk

 // return;

    // MNEMONIC METHOD (only uses 0 index address unless index is increased) bchjs.HDNode.derivePath(account, '0/i') with i++

       // root seed buffer
    const rootSeed = await bchjs.Mnemonic.toSeed(MNEMONIC);
    // master HDNode
    let masterHDNode
    if (NETWORK === 'mainnet') masterHDNode = bchjs.HDNode.fromSeed(rootSeed)
    else masterHDNode = bchjs.HDNode.fromSeed(rootSeed, 'testnet') // Testnet

    // HDNode of BIP44 account
    const account = bchjs.HDNode.derivePath(masterHDNode, "m/44'/245'/0'")
      //"m/44'/245'/0'")
    const change = bchjs.HDNode.derivePath(account, '0/0')

    // Generate an EC key pair for signing the transaction.
    const keyPair = bchjs.HDNode.toKeyPair(change)

    // get the cash address
    const cashAddress = bchjs.HDNode.toCashAddress(change)
    console.log(cashAddress);

    const slpAddress = bchjs.HDNode.toSLPAddress(change)
    console.log(slpAddress);

    // Get UTXOs held by this address.
    const data = await bchjs.Electrumx.utxo(cashAddress)
    const utxos = data.utxos
   // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)
   console.log('Finding utxos to fund tx...');

    if (utxos.length === 0) throw new Error('No UTXOs to spend! Exiting.')

    // Identify the SLP token UTXOs.
    let tokenUtxos = await bchjs.SLP.Utils.tokenUtxoDetails(utxos)
    // TOKEN UTXOS DEBUG
  //  console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`)

    // Filter out the non-SLP token UTXOs.
    const bchUtxos = utxos.filter((utxo, index) => {
      const tokenUtxo = tokenUtxos[index]
      if (!tokenUtxo.isValid) return true
    })

    // BCH UTXOS DEBUG
  //  console.log(`bchUTXOs: ${JSON.stringify(bchUtxos, null, 2)}`)

    if (bchUtxos.length === 0) {
      throw new Error('Wallet does not have a BCH UTXO to pay miner fees.')
    }

    // Filter out the token UTXOs that match the user-provided token ID.
    tokenUtxos = tokenUtxos.filter((utxo, index) => {
      if (
        utxo && // UTXO is associated with a token.
        utxo.tokenId === TOKENID && // UTXO matches the token ID.
        utxo.utxoType === 'token' // UTXO is not a minting baton.
      ) { return true }
    })
    // console.log(`tokenUtxos: ${JSON.stringify(tokenUtxos, null, 2)}`);

    if (tokenUtxos.length === 0) {
      throw new Error('No token UTXOs for the specified token could be found.')
    }

    // Choose a UTXO to pay for the transaction.
    const bchUtxo = findBiggestUtxo(bchUtxos)
    // console.log(`bchUtxo: ${JSON.stringify(bchUtxo, null, 2)}`);

    // Generate the OP_RETURN code.
    const slpSendObj = bchjs.SLP.TokenType1.generateSendOpReturn(
      tokenUtxos,
      TOKENQTY
    )
    const slpData = slpSendObj.script
    // console.log(`slpOutputs: ${slpSendObj.outputs}`);

    // BEGIN transaction construction.

    // instance of transaction builder
    let transactionBuilder
    if (NETWORK === 'mainnet') {
      transactionBuilder = new bchjs.TransactionBuilder()
    } else transactionBuilder = new bchjs.TransactionBuilder('testnet')

    // Add the BCH UTXO as input to pay for the transaction.
    const originalAmount = bchUtxo.value
    transactionBuilder.addInput(bchUtxo.tx_hash, bchUtxo.tx_pos)

    // add each token UTXO as an input.
    for (let i = 0; i < tokenUtxos.length; i++) {
      transactionBuilder.addInput(tokenUtxos[i].tx_hash, tokenUtxos[i].tx_pos)
    }

    // get byte count to calculate fee. paying 1 sat
    // Note: This may not be totally accurate. Just guessing on the byteCount size.
    // const byteCount = this.BITBOX.BitcoinCash.getByteCount(
    //   { P2PKH: 3 },
    //   { P2PKH: 5 }
    // )
    // //console.log(`byteCount: ${byteCount}`)
    // const satoshisPerByte = 1.1
    // const txFee = Math.floor(satoshisPerByte * byteCount)
    // console.log(`txFee: ${txFee} satoshis\n`)
    const txFee = 250

    // amount to send back to the sending address. It's the original amount - 1 sat/byte for tx size
    const remainder = originalAmount - txFee - 546 * 2
    if (remainder < 1) {
      throw new Error('Selected UTXO does not have enough satoshis')
    }
    // console.log(`remainder: ${remainder}`)

    console.log('adding outputs...');
    // Add OP_RETURN as first output.
    transactionBuilder.addOutput(slpData, 0)

    // Send the token back to the same wallet if the user hasn't specified a
    // different address.
    if (TO_SLPADDR === '') TO_SLPADDR = slpAddress

    // Send dust transaction representing tokens being sent.
    transactionBuilder.addOutput(
      bchjs.SLP.Address.toLegacyAddress(TO_SLPADDR),
      546
    )

    // TODO: UPDATE this to allow for multi SLP outputs

    // Return any token change back to the sender.
    if (slpSendObj.outputs > 1) {
      transactionBuilder.addOutput(
        bchjs.SLP.Address.toLegacyAddress(slpAddress),
        546
      )
    }

    // TODO: ADD MORE SLP OUTPUTS


    // Last output: send the BCH change back to the wallet.
    transactionBuilder.addOutput(
      bchjs.Address.toLegacyAddress(cashAddress),
      remainder
    )

    // Sign the transaction with the private key for the BCH UTXO paying the fees.
    let redeemScript
    transactionBuilder.sign(
      0,
      keyPair,
      redeemScript,
      transactionBuilder.hashTypes.SIGHASH_ALL,
      originalAmount
    )

    // Sign each token UTXO being consumed.
    for (let i = 0; i < tokenUtxos.length; i++) {
      const thisUtxo = tokenUtxos[i]

      transactionBuilder.sign(
        1 + i,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        thisUtxo.value
      )
    }

    // build tx
    const tx = transactionBuilder.build()

    // output rawhex
    const hex = tx.toHex()
    // console.log(`Transaction raw hex: `, hex)

    // END transaction construction.

    console.log('Sending transaction...');
    // Broadcast transation to the network
    const txidStr = await bchjs.RawTransactions.sendRawTransaction([hex])
    console.log(`Transaction ID: ${txidStr}`)

    console.log('Check the status of your transaction on this block explorer:')
    console.log(`https://explorer.bitcoin.com/bch/tx/${txidStr}`)

    sendTxId = txidStr;

  } catch (err) {
    console.error('Error in sendToken: ', err)
    console.log(`Error message: ${err.message}`)

    //error, remove userIP & address from arrays.
    removeFromArray(userIP, address);

    // log error and return to page
	console.log(err);
	res.render('index', { txid: null, error: "Server or API error. Please try again later :)", randomNumber: null, captcha: captcha[index]});
	return;
  }


	// END FULLSTACK.CASH SEND


	console.log(sendTxId);
	let re = /^([A-Fa-f0-9]{2}){32,32}$/;
	
	if (typeof sendTxId !== 'string' || !re.test(sendTxId)) {
		//error, remove userIP & address from arrays.
          removeFromArray(userIP, address);

		res.render('index', { txid: null, error: sendTxId, randomNumber: null, captcha: captcha[index]});
		return;
	}

    //add amount to total and above we deny if max is reached.
    //console.log(parseFloat(randomNum));
   	addDistAmnt(parseFloat(randomNum));

	// print all users IPs as we add them to arrays
    console.log('printing all users IPs & addresses submitted in last 12 hours:');
	console.log(users);
	console.log(addressArray);

	//add cookie for 12 hours. 
	res.cookie('SOUR_Faucet', sour_cookie, { maxAge: 43200000, httpOnly: true });
	res.render('index', { txid: sendTxId, error: null, randomNumber: randomNum});

	
})

app.listen(process.env.PORT, function () {
	console.log('SLP faucet server listening on port '+process.env.PORT+'!')
})

// Returns the utxo with the biggest balance from an array of utxos.
function findBiggestUtxo (utxos) {
  let largestAmount = 0
  let largestIndex = 0

  for (var i = 0; i < utxos.length; i++) {
    const thisUtxo = utxos[i]

    if (thisUtxo.value > largestAmount) {
      largestAmount = thisUtxo.value
      largestIndex = i
    }
  }

  return utxos[largestIndex]
}