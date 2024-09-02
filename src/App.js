import { ConnectWallet, ThirdwebSDK, Web3Button, useAddress, useSigner } from "@thirdweb-dev/react";
import "./styles/Home.css";
import abi from './abi.json';
import abiToken from './abiToken.json';
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { Polygon } from "@thirdweb-dev/chains";

export default function Home() {
  const wallet = useAddress();
  const [balance, setBalance] = useState();
  const [currentNFT, setCurrentNFT] = useState(69);
  const inputNFTs = useRef(0);
  const [quemados, setQuemados] = useState(0);
  const [balanceToken, setBalanceToken] = useState(0);
  const [aprobado, setAprobado] = useState(false);
  const [aprobado2, setAprobado2] = useState(false);
  const [totalMinteado, settotalMinteado] = useState(0);
  const [coLibre, setCoLibre] = useState(0);
  const [referral, setReferral] = useState("");
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
    const contract = await sdk.getContract("0x7b17217290caa5fC4c5942eE253b079d2A53b95B", abi);

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
    await contractToken.call("approve", ["0x7b17217290caa5fC4c5942eE253b079d2A53b95B", ethers.constants.MaxUint256]);

    const contract = await sdk.getContract("0x7b17217290caa5fC4c5942eE253b079d2A53b95B", abi);

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
