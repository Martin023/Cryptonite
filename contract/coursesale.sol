// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Marketplace {

    uint internal totalcourses = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Course {
        address payable owner;
        string name;
        string image;
        string description;
        string tutorname;
        string tutoremail;
        uint price;
        uint sold;
    }

    mapping (uint => Course) internal courses;

    function AddCourse(
        string memory _name,
        string memory _image,
        string memory _description, 
        string memory _tutorname, 
        string memory _tutoremail,
        
        uint _price
    ) public {
        uint _sold = 0;
        courses[totalcourses] = Course(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _tutorname,
            _tutoremail,
            _price,
            _sold
        );
        totalcourses++;
    }

    function readCourse(uint _index) public view returns (
        
        
        string memory, 
        string memory, 
        string memory, 
        string memory,
        string memory,
        uint, 
        uint
    ) {
        return (
            
            courses[_index].name, 
            courses[_index].image, 
            courses[_index].description, 
            courses[_index].tutorname,
            courses[_index].tutoremail, 
            courses[_index].sold,
            courses[_index].price
        );
    }
    
    function buyCourse(uint _index) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            courses[_index].owner,
            courses[_index].price
          ),
          "Transfer failed."
        );
        courses[_index].sold++;
    }
    
    function gettotalcourses() public view returns (uint) {
        return (totalcourses);

    }
    function getThankYouNote() public pure returns (string memory) {
        return "Thank you for using our platform!";
    }
}