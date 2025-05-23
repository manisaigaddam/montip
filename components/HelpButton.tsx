import { useState } from 'react';

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#5b4dcf] to-[#a280ff] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-0 max-w-lg w-full overflow-hidden">
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">How to Use Montip</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Create Your Wallet</h3>
                  <p>Click "Create Wallet" to set up your Montip smart wallet. This only needs to be done once.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Fund & Manage Your Wallet</h3>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Send tokens to your Montip wallet address to add funds.</li>
                    <li>Click the copy icon to easily copy your wallet address.</li>
                    <li>Click "Update Balances" to refresh your wallet balance.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Send Tips</h3>
                  <p>Reply to a cast with one of these formats:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>!montip tip 10 MON</li>
                    <li>!montip tip 10 $mon</li>
                  </ul>
                  <p className="mt-1 text-sm text-gray-500">Tip using the token symbol or $token (e.g., MON or $mon).</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Supported Tokens</h3>
                  <p>MON, USDC, USDT, CHOG, DAK, BEAN, WMON, WSOL, WETH, WBTC, JAIL, and many more!</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Fee Structure</h3>
                  <p>Each tip includes a fixed fee of <span className="font-bold">0.008 MON</span> to cover gas and operational costs.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Future Updates</h3>
                  <ul className="list-disc pl-5 mt-2">
                    <li><span className="font-bold">Withdraw:</span> Withdraw tokens from your Montip wallet to your address (coming soon).</li>
                    <li><span className="font-bold">Tip Events:</span> Special events where both top tippers and recipients can earn rewards (stay tuned!).</li>
                    <li>And more features to make tipping even easier!</li>
                  </ul> 
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 