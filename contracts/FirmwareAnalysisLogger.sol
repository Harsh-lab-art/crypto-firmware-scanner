// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FirmwareAnalysisLogger
 * @dev Smart contract for logging firmware analysis data on-chain with indexable events
 */
contract FirmwareAnalysisLogger {
    struct Analysis {
        string analysisId;
        string filename;
        uint256 cryptoFunctions;
        uint256 totalFunctions;
        uint256 timestamp;
        address user;
    }

    // Mapping from user address to their analyses
    mapping(address => Analysis[]) private userAnalyses;
    
    // Mapping from analysisId to Analysis for quick lookup
    mapping(string => Analysis) private analysisById;
    
    // Total number of analyses logged
    uint256 public totalAnalyses;
    
    // Events with indexed parameters for efficient querying
    event AnalysisLogged(
        address indexed user,
        string indexed analysisId,
        string filename,
        uint256 cryptoFunctions,
        uint256 totalFunctions,
        uint256 timestamp
    );
    
    event AnalysisUpdated(
        address indexed user,
        string indexed analysisId,
        uint256 cryptoFunctions,
        uint256 totalFunctions,
        uint256 timestamp
    );

    /**
     * @dev Log a new firmware analysis to the blockchain
     * @param analysisId Unique identifier for the analysis
     * @param filename Name of the firmware file analyzed
     * @param cryptoFunctions Number of cryptographic functions detected
     * @param totalFunctions Total number of functions in the firmware
     */
    function logAnalysis(
        string memory analysisId,
        string memory filename,
        uint256 cryptoFunctions,
        uint256 totalFunctions
    ) public returns (uint256) {
        require(bytes(analysisId).length > 0, "Analysis ID cannot be empty");
        require(bytes(filename).length > 0, "Filename cannot be empty");
        require(bytes(analysisById[analysisId].analysisId).length == 0, "Analysis ID already exists");

        Analysis memory newAnalysis = Analysis({
            analysisId: analysisId,
            filename: filename,
            cryptoFunctions: cryptoFunctions,
            totalFunctions: totalFunctions,
            timestamp: block.timestamp,
            user: msg.sender
        });

        userAnalyses[msg.sender].push(newAnalysis);
        analysisById[analysisId] = newAnalysis;
        totalAnalyses++;

        emit AnalysisLogged(
            msg.sender,
            analysisId,
            filename,
            cryptoFunctions,
            totalFunctions,
            block.timestamp
        );

        return userAnalyses[msg.sender].length - 1;
    }

    /**
     * @dev Update an existing analysis (if user is the owner)
     * @param analysisId Unique identifier for the analysis
     * @param cryptoFunctions Updated number of cryptographic functions
     * @param totalFunctions Updated total number of functions
     */
    function updateAnalysis(
        string memory analysisId,
        uint256 cryptoFunctions,
        uint256 totalFunctions
    ) public {
        Analysis storage analysis = analysisById[analysisId];
        require(bytes(analysis.analysisId).length > 0, "Analysis does not exist");
        require(analysis.user == msg.sender, "Only the owner can update this analysis");

        analysis.cryptoFunctions = cryptoFunctions;
        analysis.totalFunctions = totalFunctions;
        analysis.timestamp = block.timestamp;

        // Update in user's array as well
        Analysis[] storage userAnalysisArray = userAnalyses[msg.sender];
        for (uint256 i = 0; i < userAnalysisArray.length; i++) {
            if (keccak256(bytes(userAnalysisArray[i].analysisId)) == keccak256(bytes(analysisId))) {
                userAnalysisArray[i].cryptoFunctions = cryptoFunctions;
                userAnalysisArray[i].totalFunctions = totalFunctions;
                userAnalysisArray[i].timestamp = block.timestamp;
                break;
            }
        }

        emit AnalysisUpdated(
            msg.sender,
            analysisId,
            cryptoFunctions,
            totalFunctions,
            block.timestamp
        );
    }

    /**
     * @dev Get the number of analyses logged by a user
     * @param user Address of the user
     * @return Number of analyses
     */
    function getAnalysisCount(address user) public view returns (uint256) {
        return userAnalyses[user].length;
    }

    /**
     * @dev Get a specific analysis by user and index
     * @param user Address of the user
     * @param index Index in the user's analysis array
     * @return Analysis details
     */
    function getAnalysis(address user, uint256 index) 
        public 
        view 
        returns (
            string memory analysisId,
            string memory filename,
            uint256 cryptoFunctions,
            uint256 totalFunctions,
            uint256 timestamp
        ) 
    {
        require(index < userAnalyses[user].length, "Index out of bounds");
        Analysis memory analysis = userAnalyses[user][index];
        return (
            analysis.analysisId,
            analysis.filename,
            analysis.cryptoFunctions,
            analysis.totalFunctions,
            analysis.timestamp
        );
    }

    /**
     * @dev Get analysis by ID
     * @param analysisId Unique identifier for the analysis
     * @return Analysis details
     */
    function getAnalysisById(string memory analysisId)
        public
        view
        returns (
            string memory filename,
            uint256 cryptoFunctions,
            uint256 totalFunctions,
            uint256 timestamp,
            address user
        )
    {
        Analysis memory analysis = analysisById[analysisId];
        require(bytes(analysis.analysisId).length > 0, "Analysis does not exist");
        return (
            analysis.filename,
            analysis.cryptoFunctions,
            analysis.totalFunctions,
            analysis.timestamp,
            analysis.user
        );
    }

    /**
     * @dev Get all analyses for a user
     * @param user Address of the user
     * @return Array of analyses
     */
    function getAllUserAnalyses(address user) 
        public 
        view 
        returns (Analysis[] memory) 
    {
        return userAnalyses[user];
    }

    /**
     * @dev Check if an analysis ID exists
     * @param analysisId Unique identifier for the analysis
     * @return bool indicating if the analysis exists
     */
    function analysisExists(string memory analysisId) public view returns (bool) {
        return bytes(analysisById[analysisId].analysisId).length > 0;
    }
}
