
import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "Unknown";
    const totalTipped = searchParams.get("totalTipped") || "0";
    const totalEarned = searchParams.get("totalEarned") || "0";
    const pfpUrl = searchParams.get("pfpUrl") || "";
    
    console.log("Stats Image Debug:", { username, totalTipped, totalEarned, pfpUrl });

        return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #8b5dcf 0%, #a280ff 100%)",
            fontFamily: "system-ui, sans-serif",
            position: "relative",
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              background: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 60%),
                          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%),
                          radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }}
          />
          
          {/* Main Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "35px 45px",
              margin: "30px",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3)",
              border: "3px solid rgba(139, 93, 207, 0.3)",
              position: "relative",
              width: "480px",
            }}
          >
            {/* Header */}
            <h1
              style={{
                fontSize: "25px",
                fontWeight: "800",
                color: "#8b5dcf",
                margin: "0 0 25px 0",
                textAlign: "center",
              }}
            >
              Check out my Montip stats!
            </h1>
            
            {/* Profile Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              {pfpUrl && pfpUrl.startsWith('http') ? (
                <img
                  src={pfpUrl}
                  alt="Profile"
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    marginRight: "12px",
                    objectFit: "cover",
                    border: "3px solid #8b5dcf",
                  }}
                />
              ) : (
                                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      background: "#8b5dcf",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                      fontSize: "18px",
                      color: "white",
                      border: "3px solid #8b5dcf",
                    }}
                  >
                  👤
                </div>
              )}
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#8b5dcf",
                  margin: "0",
                }}
              >
                @{username}
              </h2>
            </div>

            {/* Stats Section */}
            <div
              style={{
                display: "flex",
                gap: "20px",
                width: "100%",
                justifyContent: "center",
              }}
            >
              {/* Tipped Stats */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)",
                  padding: "20px 30px",
                  borderRadius: "16px",
                  minWidth: "140px",
                  boxShadow: "0 10px 25px rgba(139, 93, 207, 0.2)",
                  border: "2px solid rgba(139, 93, 207, 0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "900",
                    color: "#6d28d9",
                    margin: "0 0 5px 0",
                  }}
                >
                  {totalTipped}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#7c3aed",
                    margin: "0",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  MON Tipped
                </div>
              </div>

              {/* Earned Stats */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  padding: "20px 30px",
                  borderRadius: "16px",
                  minWidth: "140px",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                  border: "2px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "900",
                    color: "#1d4ed8",
                    margin: "0 0 5px 0",
                  }}
                >
                  {totalEarned}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    margin: "0",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  MON Earned
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 400,
      }
    );
  } catch (error) {
    console.error("Error generating stats image:", error);
    return new Response("Error generating image", { status: 500 });
  }
} 
