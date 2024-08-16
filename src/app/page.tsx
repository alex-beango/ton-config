"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TonConnect from "@tonconnect/sdk";
import { Button } from "antd";
import {
  TonConnectButton,
  TonConnectUIProvider,
  useIsConnectionRestored,
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { TonProofService } from "@/utils";

function TonSDK() {
  const [connector, setConnector] = useState<any>();
  const [walletList, setWalletList] = useState<any[]>([]);

  const fetchWalletList = useCallback(async () => {
    const walletsList = await connector.getWallets();
    setWalletList(walletsList);
    console.log("*********fetch", walletsList);
    const unsubscribe = connector.onStatusChange((walletInfo) => {
      console.log("Connection status:", walletInfo);
    });
    return () => unsubscribe();
  }, [connector]);

  const connectTG = useCallback(async () => {
    if (!connector) return;

    const walletsList = await connector.getWallets();
    const tgWallet = walletsList[0] as any;
    console.log("*********fetch", walletsList);
    const unsubscribe = connector.onStatusChange((walletInfo: any) => {
      console.log("Connection status:", walletInfo);
    });

    const link = connector.connect({
      universalLink: tgWallet.universalLink,
      bridgeUrl: tgWallet.bridgeUrl,
    });

    console.log("Connection link:", link);
    window.open(link, "_blank");

    return () => unsubscribe();
  }, [connector]);

  const connectTonKeeper = useCallback(async () => {
    try {
      const walletsList = await connector.getWallets();
      const tgWallet = walletsList[1] as any;
      console.log("*********fetch", walletsList);
      const unsubscribe = connector.onStatusChange((walletInfo: any) => {
        console.log("Connection status:", walletInfo);
      });

      const link = connector.connect({
        universalLink: tgWallet.universalLink,
        bridgeUrl: tgWallet.bridgeUrl,
      });

      alert("Connection link:" + link);
      window.open(link, "_blank");
    } catch (error) {
      alert("error" + JSON.stringify(error));
    }
  }, [connector]);

  const sendTon = useCallback(async () => {
    await connector.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address:
            "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F", // 目的地址
          amount: "20000000", //以nanotons计的Toncoin
        },
      ],
    });
  }, [connector]);

  const disConnect = useCallback(async () => {
    if (!connector) return alert("no connector");

    connector.disconnect();
  }, [connector]);

  const init = useCallback(async () => {
    if (!localStorage) return;

    const connector = new TonConnect({
      manifestUrl:
        "https://raw.githubusercontent.com/alex-beango/ton-config/main/tonconnect-manifest.json",
      storage: localStorage,
    });
    setConnector(connector);
  }, []);

  const connectCurrentWallet = useCallback(
    async (item: any) => {
      if (!connector) return;

      const link = connector.connect({
        universalLink: item.universalLink,
        bridgeUrl: item.bridgeUrl,
      });
      console.log("Connection link:", link);
      window.open(link, "_blank");
      return;
    },
    [connector]
  );

  return (
    <main className=" min-h-screen flex-col items-center justify-between">
      <div className="font-bold text-[20px]"></div>
      <button onClick={init}>init</button>
      <div>======</div>
      <button onClick={fetchWalletList}>fetchWalletList</button>
      <div>======</div>
      <button onClick={connectTG}>connect TG</button>
      <div>======</div>
      <button onClick={connectTonKeeper}>connect tonkeeper</button>
      <div>======</div>
      <button onClick={sendTon}>send</button>
      <div>======</div>
      <button style={{ color: "red" }} onClick={disConnect}>
        Disconnect!
      </button>

      <div>********</div>
      <div>
        <span>wallet list</span>
        <div>
          {walletList.map((item: any) => {
            return (
              <Button
                key={item.appName}
                onClick={() => connectCurrentWallet(item)}
              >
                {item.appName}
              </Button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function TonUIReact() {
  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false);
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const connectionRestored = useIsConnectionRestored();

  console.log("connectionRestored", connectionRestored);
  console.log("wallet", wallet);

  const signArr = useMemo(() => {
    return Object.entries(wallet?.connectItems?.tonProof?.proof || {}) || [];
  }, [wallet]);

  console.log("signArr", wallet?.connectItems?.tonProof, signArr);

  // const verifyAndGenerateToken = useCallback(() => {
  //   const getPubKey = async () => {
  //     return wallet?.account.publicKey;
  //   };

  //   const result = new TonProofService()?.checkProof({
  //     payload: wallet?.connectItems?.tonProof,
  //     getWalletPublicKey: getPubKey,
  //   });

  //   console.log("result", result);
  // }, [wallet?.account.publicKey, wallet?.connectItems?.tonProof]);

  useEffect(() => {
    tonConnectUI.setConnectRequestParameters({
      state: "ready",
      value: { tonProof: "E5B4ARS6CdOI2b5e1jz0jnS-x-a3DgfNXprrg_3pec0=" },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!connectionRestored)
    return (
      <main className=" p-8 min-h-screen flex-col items-center justify-between">
        <div className="flex-1 ">Please wait...</div>
      </main>
    );

  return (
    <main className=" p-8 min-h-screen flex-col items-center justify-between">
      <header className="flex items-center justify-between">
        <span>My App with React UI</span>
        <TonConnectButton />
      </header>

      <section>
        <span className="text-xl">useTonAddress</span>
        <div>
          <span className="text-l text-red-500">User-friendly address:</span>{" "}
          <span>{userFriendlyAddress}</span>
        </div>
        <div>
          <span className="text-l text-red-500">Raw address:</span>{" "}
          <span>{rawAddress}</span>
        </div>
      </section>
      <section>
        <span className="text-xl">wallet</span>
        <div>
          <span className="text-l text-red-500">Connected wallet:</span>{" "}
          <span>{wallet?.name}</span>
        </div>
        <div>
          <span className="text-l text-red-500">Device:</span>{" "}
          <span>{wallet?.device?.appName}</span>
        </div>
      </section>
      <section>
        <span className="text-xl">Returned Sign Message</span>
        {signArr.map(([key, value]) => {
          return (
            <div key={key}>
              <span className="text-l text-red-500">{key}</span>
              {": "}
              <span>{JSON.stringify(value)}</span>
            </div>
          );
        })}
      </section>
      {/* <section>
        <span className="text-xl">Verify And Generate Token</span>
        <div>
          <Button onClick={verifyAndGenerateToken}>Go</Button>
        </div>
      </section> */}
    </main>
  );
}

export default function Home() {
  return (
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/alex-beango/ton-config/main/tonconnect-manifest.json">
      <TonUIReact />
    </TonConnectUIProvider>
  );
}
