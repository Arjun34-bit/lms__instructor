import { Table, Button, Card } from "antd";
import { BsCameraReelsFill } from "react-icons/bs";
import { LiaFileVideoSolid } from "react-icons/lia";
import { AiOutlineAreaChart } from "react-icons/ai";
import { FiPlusCircle, FiClock, FiBookOpen, FiXCircle } from "react-icons/fi";
import AntdSpinner from "../Spinner/Spinner";
// import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AddReel from "./add-reel/addReel";
import { getReelColumns } from "./add-reel/data/reelColumn";
const Reel = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddReel, setOpenAddReel] = useState(false);

  const reelsColumn = getReelColumns();

  return (
    <div
      className="content-area p-4"
      style={{
        marginLeft: "250px",
        marginRight: "20px",
        marginTop: "30px",
        flexGrow: 1,
      }}
    >
      {/* heading */}
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <div>
            <BsCameraReelsFill
              style={{ marginRight: "10px", fontSize: "30px" }}
            />
          </div>
          <div>
            <h2>Reels</h2>
          </div>
        </div>
        <div style={{ marginRight: "20px" }}>
          <Button
            type="primary"
            style={{ padding: "20px 10px" }}
            onClick={() => setOpenAddReel(true)}
          >
            <FiPlusCircle style={{ fontSize: "20px" }} /> Add a Reel
          </Button>
        </div>
      </div>

      {/* courses stats */}
      <div style={{ display: "flex", gap: "2rem" }}>
        <Card
          style={{ width: "18rem", marginTop: "30px", cursor: "pointer" }}
          bordered={true}
        >
          <Card.Meta
            avatar={<LiaFileVideoSolid style={{ fontSize: "30px" }} />}
            title="Total Reels"
            description={
              <div>
                <p style={{ fontSize: 17, fontWeight: 600 }}>0</p>
              </div>
            }
          />
        </Card>

        <Card
          style={{ width: "18rem", marginTop: "30px", cursor: "pointer" }}
          bordered={true}
        >
          <Card.Meta
            avatar={<FiClock style={{ fontSize: "30px" }} />}
            title="Approval Pending"
            description={
              <div>
                <p style={{ fontSize: 17, fontWeight: 600 }}>0</p>
              </div>
            }
          />
        </Card>

        <Card
          style={{ width: "18rem", marginTop: "30px", cursor: "pointer" }}
          bordered={true}
        >
          <Card.Meta
            avatar={<AiOutlineAreaChart style={{ fontSize: "30px" }} />}
            title="Most Viewed"
            description={
              <div>
                <p style={{ fontSize: 17, fontWeight: 600 }}>0</p>
              </div>
            }
          />
        </Card>
      </div>

      {/* tables to see all courses */}
      <div className="mt-5">
        <Table
          className="shadow-sm"
          columns={reelsColumn}
          bordered
          rowKey="id"
        />
      </div>

      {/* Add Reel Modal */}
      <AddReel visible={openAddReel} onClose={() => setOpenAddReel(false)} />
    </div>
  );
};

export default Reel;
