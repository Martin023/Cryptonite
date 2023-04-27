import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import onlineSchoolAbi from '../contract/onlineschool.abi.json'

const MPContractAddress = "0x55De4F573b13c2841F6334a771c37f5F5159B4cF"
const ERC20_DECIMALS = 18

let kit
let contract
let courselist = []


const connectCeloWallet = async function () {
  if (window.celo) {
      notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(onlineSchoolAbi, MPContractAddress)

    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}


// const courses = [
//   {
//     course_name: "Giant BBQ",
//     course_image: "https://i.imgur.com/yPreV19.png",
//     course_description: `Grilled chicken, beef, fish, sausages, bacon, 
//       vegetables served with chips.`,
//     tutor_name: "Kimironko Market",
//     owner: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
//     tutor_email:"hdwhe@jhwedh.com",
//     price: 3,
//     sold: 27,
//     index: 0,
//   },
//   {
//     course_name: "Giant BBQ",
//     course_image: "https://i.imgur.com/yPreV19.png",
//     course_description: `Grilled chicken, beef, fish, sausages, bacon, 
//       vegetables served with chips.`,
//     tutor_name: "Kimironko Market",
//     owner: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
//     tutor_email:"hdwhe@jhwedh.com",
//     price: 3,
//     sold: 27,
//     index: 0,
//   },
//   {
//     course_name: "Giant BBQ",
//     course_image: "https://i.imgur.com/yPreV19.png",
//     course_description: `Grilled chicken, beef, fish, sausages, bacon, 
//       vegetables served with chips.`,
//     tutor_name: "Kimironko Market",
//     owner: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
//     tutor_email:"hdwhe@jhwedh.com",
//     price: 3,
//     sold: 27,
//     index: 0,
//   },
//   {
//     course_name: "Giant BBQ",
//     course_image: "https://i.imgur.com/yPreV19.png",
//     course_description: `Grilled chicken, beef, fish, sausages, bacon, 
//       vegetables served with chips.`,
//     tutor_name: "Kimironko Market",
//     owner: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
//     tutor_email:"hdwhe@jhwedh.com",
//     price: 3,
//     sold: 27,
//     index: 0,
//   },
// ]

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}
const getCourses = async function() {
  
  const _allcourses = await contract.methods.gettotalcourses().call()
 

  console.log(_allcourses)
  const _courses = []
  for (let i = 0; i < _allcourses; i++) {
    let _product = new Promise(async (resolve, reject) => {
      let p = await contract.methods.readCourse(i).call()
      resolve({
        index: i,
        
        name: p[0],
        image: p[1],
        description: p[2],
        tutorname: p[3],
        tutoremail:p[4],
        
        sold: p[5],
        price: new BigNumber(p[6]),
      })
    })
    _courses.push(_product)
  }
  courselist = await Promise.all(_courses)
  rendercourses()

}

function rendercourses() {
  document.getElementById("courseslist").innerHTML = ""
  courselist.forEach((_course) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = productTemplate(_course)
    document.getElementById("courseslist").appendChild(newDiv)
  })
}

function productTemplate(_course) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_course.course_image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_course.sold} Sold
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_course.tutorname)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_course.course_name}</h2>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_course.course_description}             
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_course.tutor_email}</span>
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" id=${
            _course.index
          }>
            Buy for ${_course.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getCourses()
  // rendercourses()
  notificationOff()
})

document.querySelector("#uploadbtn").addEventListener("click", async (e) => {
    // console.log("uploading")
    const params = [
      
      document.getElementById("cname").value,
      document.getElementById("courseurl").value,
      document.getElementById("coursedescription").value,
      document.getElementById("tutorname").value,
      document.getElementById("tutoremail").value,
      new BigNumber(document.getElementById("cprice").value,).shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    
    
    notification(`⌛ Adding "${params[0]}"...`)

    try {
      const result = await contract.methods
        .AddCourse(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getCourses()
  
  })

// document.querySelector("#marketplace").addEventListener("click", (e) => {
//   if(e.target.className.includes("buyBtn")) {
//     const index = e.target.id
//     courses[index].sold++
//     notification(`🎉 You successfully bought "${courses[index].name}".`)
//     rendercourses()
//   }
// })
