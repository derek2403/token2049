// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal interfaces
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from,address to,uint256 amount) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
}

interface IStakedCelo {
    /// @notice Stake CELO -> mint stCELO (payable)
    function deposit() external payable returns (uint256 stCeloAmount);

    /// @notice Burn stCELO -> receive CELO
    function withdraw(uint256 stCeloAmount) external returns (uint256 celoOut);
}

/**
 * @title SimpleStCeloRouter
 * @notice Minimal router:
 *  - stake(): user sends CELO, router calls stCELO.deposit(), stCELO minted -> sent to user
 *  - unstake(amount): user approves router to pull stCELO, router calls stCELO.withdraw(), CELO -> sent to user
 *
 * Security notes:
 *  - Uses a simple nonReentrant guard.
 *  - Does not keep balances; forwards assets immediately.
 *  - No owner functions; feel free to add pausing if you want.
 */
contract SimpleStCeloRouter {
    error ZeroAmount();
    error TransferFailed();
    error ReceiveDisabled();

    IStakedCelo public immutable stCELO;
    IERC20 public immutable stCELO_ERC20;

    // --- simple reentrancy guard ---
    uint256 private _lock;
    modifier nonReentrant() {
        require(_lock == 0, "REENTRANCY");
        _lock = 1;
        _;
        _lock = 0;
    }

    constructor(address stCelo_) {
        stCELO = IStakedCelo(stCelo_);
        stCELO_ERC20 = IERC20(stCelo_);
    }

    /**
     * @notice Stake CELO and receive stCELO directly.
     * @dev Send CELO as msg.value. Mints stCELO to this contract, then forwards to msg.sender.
     */
    function stake() external payable nonReentrant returns (uint256 minted) {
        if (msg.value == 0) revert ZeroAmount();
        // stake CELO -> mint stCELO
        minted = stCELO.deposit{value: msg.value}();
        // forward stCELO to user
        bool ok = stCELO_ERC20.transfer(msg.sender, minted);
        if (!ok) revert TransferFailed();
    }

    /**
     * @notice Unstake stCELO back to CELO.
     * @param amount Amount of stCELO to burn (user must approve this contract first).
     */
    function unstake(uint256 amount) external nonReentrant returns (uint256 celoOut) {
        if (amount == 0) revert ZeroAmount();
        // pull stCELO from user
        bool ok = stCELO_ERC20.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();
        // burn stCELO -> receive CELO
        celoOut = stCELO.withdraw(amount);
        // forward CELO to user
        (ok, ) = msg.sender.call{value: celoOut}("");
        if (!ok) revert TransferFailed();
    }

    // Prevent accidental CELO transfers (use stake() instead)
    receive() external payable {
        revert ReceiveDisabled();
    }

    fallback() external payable {
        revert ReceiveDisabled();
    }
}

