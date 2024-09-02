import { ConnectWallet, ThirdwebSDK, Web3Button, useAddress, useSigner } from "@thirdweb-dev/react";
import "./styles/Home.css";
import abi from './abi.json';
import abiToken from './abiToken.json';
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { Polygon } from "@thirdweb-dev/chains";

export default function Home() {
  const wallet = useAddress();
  const [referral, setReferral] = useState("");
  const [referralOfUser, setReferralOfUser] = useState("");
  const [directReferrals, setDirectReferrals] = useState("");
  const [missedOpportunities, setMissedOpportunities] = useState("");
  const [payedExtra, setPayedExtra] = useState("");
  const [totalTree, setTotalTree] = useState("");
  const [balanceContrato, setBalanceContrato] = useState("");
  const [balanceVault, setBalanceVault] = useState("");
  const [infoPools, setInfoPools] = useState({
    data: [
      { pool: 1, usersCount: 0, wallets: [] },
      { pool: 2, usersCount: 0, wallets: [] },
      { pool: 3, usersCount: 0, wallets: [] },
      { pool: 4, usersCount: 0, wallets: [] },
      { pool: 5, usersCount: 0, wallets: [] },
      { pool: 6, usersCount: 0, wallets: [] },
      { pool: 7, usersCount: 0, wallets: [] },
    ],
    status: false,
  });

  const loadInfo = async () => {
    console.log(wallet);
    const sdk = new ThirdwebSDK("polygon");
    const contract = await sdk.getContract("0x6619B3D7bCcb53F039C9905E190158e694E4A2B4", abi);
    const contractToken = await sdk.getContract("0x31B4245d9f88DA6Fa01A14398adA46b177c7F2ba", abiToken);

    if (wallet != undefined) {
      console.log(wallet);
      const updatedData = await Promise.all(
        infoPools.data.map(async (poolInfo, index) => {
          const poolId = index + 1;
          const pool = await contract.call("pools", [poolId]);
          const getQueue = await contract.call("getQueue", [poolId]);
          const usersCount = parseInt(pool.numUsers._hex, 16);
          return { pool: poolId, usersCount: usersCount, wallets: getQueue };
        })
      );
      const users = await contract.call("users", [wallet]);
      console.log(users)
      if(users.referrer == "0x0000000000000000000000000000000000000000"){
        setReferralOfUser("USTED NO TIENE REFERIDO RECUERDE EN SU PRIMERA COMPRA PONERLO ARRIBA")
      }else{
        setReferralOfUser(users.referrer)
      }
      setDirectReferrals(parseInt(users.directReferrals._hex,16))
      setMissedOpportunities(parseInt(users.missedOpportunities._hex,16))
      setPayedExtra(parseInt(users.payedExtra._hex,16))
      setTotalTree(parseInt(users.totalTree._hex,16))
      
      const balanceContrato = await contractToken.call("balanceOf", ["0x6619B3D7bCcb53F039C9905E190158e694E4A2B4"]);
      const balanceVault = await contractToken.call("balanceOf", ["0x3a74C3d3c9F197A4E1f8DEC55031C8f5931F9FFe"]);

      setBalanceContrato(parseInt(balanceContrato._hex,16))
      setBalanceVault(parseInt(balanceVault._hex,16))

      setInfoPools({ data: updatedData, status: true });
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadInfo();
    }, 3000); // Llama a loadInfo cada 3 segundos
  
    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
  }, [wallet]);

  const signer = useSigner();

  const joinPool = async (pool) => {
    if (!signer) {
      console.error("Signer is undefined");
      return;
    }
    const sdk = ThirdwebSDK.fromSigner(signer, Polygon);

    const contractToken = await sdk.getContract("0x31B4245d9f88DA6Fa01A14398adA46b177c7F2ba", abiToken);
    await contractToken.call("approve", ["0x6619B3D7bCcb53F039C9905E190158e694E4A2B4", ethers.constants.MaxUint256]);

    const contract = await sdk.getContract("0x6619B3D7bCcb53F039C9905E190158e694E4A2B4", abi);

    if (referral != "") {
      await contract.call("joinPool", [pool, referral, wallet]);
    } else {
      await contract.call("joinPool", [pool, "0x8d2829EE0F435Bd5E512205721bD24BdD845B077", wallet]);
    }
    alert("COMPRA CON ÉXITO");
  };

  return (
    <main className="main">
      <div className="container">
        <div className="header">
          <h1 className="title">MandaLink</h1>
          <ConnectWallet />
          <div className="connect"></div>
        </div>
        <center>
          <a className="card" target="_blank" rel="noopener noreferrer">
            <div className="card-text">
              <center>
                <h2 className="gradient-text-2">Compra tu pool</h2>
                <br />
                Para su primera compra debe indicar su referido:
                <input
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                />
                <br />
                <br />
                <p>INFO GENERAL</p>
                <p>Balance Contrato: {balanceContrato / 1000000}</p>
                <br />
                <p>Balance Vault: {balanceVault / 1000000}</p>
                <br />
                <br />
                <br />

                <p>INFO PERSONAL</p>
                <p>Wallet conectada: {wallet}</p>
                <br />
                <p>Sponsor: {referralOfUser}</p>
                <br />
                <p>Cantidad de directos: {directReferrals}</p>
                <br />
                <p>Total perdido: {missedOpportunities / 1000000}$</p>
                <br />
                <p>Cantidad de dinero en excedente: {payedExtra / 1000000}$</p> 
                <br />
                <p>Cantidad generado por mi arbol: {totalTree / 1000000}$</p> 
                <br />
                <br />
                {infoPools.data.map((poolInfo, index) => (
                  <div key={index} style={{ display: "inline-block", border: "1px solid", margin: "10px" }}>
                    <p>Pool {poolInfo.pool}</p>
                    <p>Precio: ${[50, 100, 200, 300, 400, 500, 1000][index]}</p> {/* Añadido aquí */}
                    <br />
                    <button onClick={() => joinPool(poolInfo.pool)}>Entrar</button>
                    <br />
                    {infoPools.status ? (
                      <>
                        <p>
                          Cantidad de usuarios en este pool: {poolInfo.usersCount}
                        </p>
                        <br />
                        <p>
                          Listado de wallets en este pool:
                          <br />
                          {poolInfo.wallets.map((wallet, idx) => (
                            <span key={idx}>
                              {wallet}
                              <br />
                            </span>
                          ))}
                        </p>
                      </>
                    ) : (
                      <>Cargando...</>
                    )}
                  </div>
                ))}

              
              </center>
            </div>
          </a>
        </center>
        <div className="grid"></div>
      </div>
    </main>
  );
}
