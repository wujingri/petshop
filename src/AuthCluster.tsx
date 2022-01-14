import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import setupReceiverAccount from "flow/transactions/pets/SetupReceiverAccount.tx";
import getAccountTokenIds from "flow/scripts/pets/GetAccountTokenIds.script";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

const AuthCluster = ({ setActivated }: AuthClusterProps) => {
  const [user, setUser]: [any, any] = useState({ loggedIn: null });
  const [accountReady, setAccountReady]: [any, any] = useState(false);
  const [dropDown, setDropDown]: [any, any] = useState(false);
  const toggleDropDown = () => {
    setDropDown(!dropDown);
  };

  const setupAccount = async () => {
    const txId = await setupReceiverAccount();
    console.log("txId: ", txId);
    console.log(
      "successfully setup receiver collection for",
      fcl.currentUser()
    );
    setAccountReady(true);
    setActivated(true);
  }

  useEffect(() => {
    fcl.currentUser().subscribe(async (user: any) => {
      let result = await getAccountTokenIds(user?.addr);
      if (user.loggedIn && result?.length >= 0) {
        setAccountReady(true);
      } else {
        setAccountReady(false);
      }
      setUser(user);
      setDropDown(false);
    });
  }, []);

  useEffect(() => {
    const f = async () => {
      let result = await getAccountTokenIds(user?.addr);
      console.log("result: ", result);
      if (result?.error) {
        setAccountReady(false);
      } else {
        setAccountReady(true);
      }
    }
    f();
  }, [user]);

  if (user.loggedIn) {
    localStorage.setItem("user", user);
    return (
      <div className={`dropdown is-right ${dropDown && "is-active"}`}>
        <div className="dropdown-trigger">
          <button
            className="button is-primary is-light"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            onClick={() => {
              setDropDown(!dropDown);
            }}
          >
            <span>
              {
                accountReady ?
                  <span>✔️</span> :
                  <Tippy
                    className="floating"
                    content="Activate your collection"
                    placement="left"
                    theme="light"
                    offset={[0, 30]}
                    inertia
                  >
                    <span>❌</span>
                  </Tippy>
              }
              &nbsp;
              {user?.addr ?? "No Address"}
            </span>
            <span className="icon">
              <FontAwesomeIcon icon={dropDown ? faAngleUp : faAngleDown} size="1x" />
            </span>
          </button>
        </div>
        <div
          className={`dropdown-menu ${dropDown ? "" : "is-hidden"}`}
          id="dropdown-menu"
          role="menu"
          onBlur={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropDown();
          }}
        >
          <Menu user={user} setupAccount={setupAccount} />
        </div>
      </div>
    );
  }

  return (
    <Tippy
      className="floating"
      content="Log in to buy pets"
      placement="left"
      theme="light"
      showOnCreate
      inertia
    >
      <div className="content">
        <div className="buttons">
          <button className="button is-primary is-outlined is-inverted" onClick={fcl.logIn}>
            Log In
          </button>
          <button className="button is-primary is-outlined is-inverted" onClick={fcl.signUp}>
            Sign Up
          </button>
        </div>
      </div>
    </Tippy>
  );
}

const Menu = ({ user, setupAccount }: MenuProps) => (
  <div className="dropdown-content">
  <a className="dropdown-item" href="#" onClick={async () => {
    let txId = await setupAccount();
  }}>
    Activate Collection
  </a>
  <a className="dropdown-item" href="#" onClick={async () => {
    let ids = await getAccountTokenIds(user.addr);
  }}>
    Get IDS
  </a>
  <hr className="dropdown-divider" />
  <a className="dropdown-item" href="#" onClick={fcl.unauthenticate}>
    Log Out
  </a>
</div>
);

interface AuthClusterProps {
  setActivated: (flag: boolean) => void
}

interface MenuProps {
  setupAccount: () => void,
  user: any,
}

export default AuthCluster;