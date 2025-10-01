// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleStaking
 * @notice Simple 1:1 staking contract
 * - Deposit CELO -> Receive stCELO tokens (1:1 ratio)
 * - Burn stCELO -> Receive CELO back
 * - You control everything!
 */
contract SimpleStaking is ERC20, Ownable {
    
    event Staked(address indexed user, uint256 celoAmount, uint256 sharesReceived);
    event Unstaked(address indexed user, uint256 sharesAmount, uint256 celoReceived);
    
    constructor() ERC20("Staked CELO", "stCELO") Ownable(msg.sender) {}
    
    /**
     * @notice Stake CELO and receive stCELO tokens (1:1)
     * @dev Send CELO as msg.value, receive same amount in stCELO
     */
    function stake() external payable returns (uint256) {
        require(msg.value > 0, "Cannot stake 0");
        
        uint256 shares = msg.value; // 1:1 ratio for simplicity
        
        // Mint stCELO tokens to the user
        _mint(msg.sender, shares);
        
        emit Staked(msg.sender, msg.value, shares);
        
        return shares;
    }
    
    /**
     * @notice Unstake stCELO and receive CELO back (1:1)
     * @param amount Amount of stCELO to burn
     */
    function unstake(uint256 amount) external returns (uint256) {
        require(amount > 0, "Cannot unstake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient stCELO balance");
        require(address(this).balance >= amount, "Insufficient CELO in contract");
        
        // Burn stCELO tokens
        _burn(msg.sender, amount);
        
        // Send CELO back to user
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "CELO transfer failed");
        
        emit Unstaked(msg.sender, amount, amount);
        
        return amount;
    }
    
    /**
     * @notice Get total CELO staked in contract
     */
    function totalStaked() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Emergency withdraw (owner only)
     * @dev In case of emergencies, owner can withdraw CELO
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }
    
    /**
     * @notice Accept CELO deposits
     */
    receive() external payable {}
}

