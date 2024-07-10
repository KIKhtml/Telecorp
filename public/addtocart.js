document.addEventListener("DOMContentLoaded", () => {
  var cart = [];

  loadProducts();

  // Load products from the server
  function loadProducts() {
    fetch("/pullProd")
      .then((response) => response.json())
      .then((data) => {
        categories = [...new Set(data.map((item) => item))];
        let i = 0;
        const root = document.getElementById("root");
        root.innerHTML = data
          .map((item, index) => {
            const { id, name, code, price, img_name } = item;
            return `
                <div class='box' id='product${id}'>
                  <div class='upDel'>
                    <div>
                      <span
                        class="material-symbols-outlined closeupdateForm"
                        onclick="updateForm(${id})"
                      >
                        edit
                      </span>
                    </div>
                    <div class="delProd" onclick="delProd(${id})">&#128473;</div>
                  </div>
                  <div class='img-box'>
                    <img class='images' src='../uploads/${img_name}' alt='${name}'></img>
                  </div>
                  <div class='bottom'>
                  <div class='desp'>
                  <p>Product</p>
                  <p class='itemProd'>${name}</p>
                  </div>
                    <div class='desp'>
                  <p>Code</p>
                    <p class='codeProd'>${code}</p>
                    </div>
                    <div class='desp'>
                  <p>Price</p>
                    <h2>$ ${price}.00</h2>
                    </div>
                    <button onclick='addtocart(${index})'>Add to cart</button>
                    </div>
                </div>`;
          })
          .join("");
      })

      .catch((error) => {
        console.error("Error loading products:", error);
      });
  }

  // search input
  document.querySelector("#search-input").addEventListener("input", filterList);

  function filterList() {
    const searchInput = document.querySelector("#search-input");
    const filter = searchInput.value.toLowerCase();
    const listItems = document.querySelectorAll(".itemProd");
    const codeItems = document.querySelectorAll(".codeProd");
    const boxItems = document.querySelectorAll(".box");

    boxItems.forEach((box, index) => {
      const itemText = listItems[index].textContent.toLowerCase();
      const codeText = codeItems[index].textContent.toLowerCase();

      if (itemText.includes(filter) || codeText.includes(filter)) {
        box.style.display = "";
      } else {
        box.style.display = "none";
      }
    });
  }

  // Delete product
  window.delProd = (id, event) => {
    // console.log("Deleting product with id:", id);
    fetch(`/deleteProd/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const productElement = document.getElementById(`product${id}`);
        if (productElement) {
          productElement.remove();
        }
        // console.log("Deleted!!");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Add product to cart
  window.addtocart = function (index) {
    cart.push({ ...categories[index] });
    displaycart();
  };

  // Display cart items
  function displaycart() {
    let j = 0,
      total = 0;
    document.getElementById("count").innerHTML = cart.length;
    if (cart.length === 0) {
      document.getElementById("cartItem").innerHTML = "Your cart is empty";
      document.getElementById("total").innerHTML = "$ 0.00";
    } else {
      document.getElementById("cartItem").innerHTML = cart
        .map((item) => {
          const { code, name, price } = item;
          total += price;
          document.getElementById("total").innerHTML = `$ ${total}.00`;
          return (
            `<div class='cart-item'>
            <div style='text-align:left'>
                  <div style='font-size:12px;font-weight:bold;'>${name}</div>
                  <div style='font-size:12px;'>${code}</div>
                  </div>
                  <h2 style='font-size: 15px;'>$ ${price}.00</h2>` +
            `<i class='fa-solid fa-trash' onclick='delElement(${j++})'></i>
                  </div>`
          );
        })
        .join("");
    }
  }

  // Delete cart item
  window.delElement = function (index) {
    cart.splice(index, 1);
    displaycart();
  };

  // Show cart
  window.showcart = function () {
    let sidebar = document.getElementsByClassName("sidebar")[0];
    if (sidebar.style.display === "block") {
      sidebar.style.display = "none";
    } else {
      sidebar.style.display = "block";
    }
  };

  // Close cart
  window.closecart = function () {
    let sidebar = document.getElementsByClassName("sidebar")[0];
    sidebar.style.display = "none";
  };

  // Show form
  window.formProd = function () {
    let formProd = document.getElementsByClassName("form")[0];
    if (formProd.style.display === "block") {
      formProd.style.display = "none";
    } else {
      formProd.style.display = "block";
    }
  };

  // Close form
  window.closeForm = function () {
    let formProd = document.getElementsByClassName("form")[0];
    formProd.style.display = "none";
  };

  // Close update form
  window.closeupdateForm = function () {
    let formProd = document.getElementsByClassName("updateForm")[0];
    formProd.style.display = "none";
  };

  // Preview img add product
  const imgInp = document.getElementById("img");
  const blah = document.getElementById("blah");
  imgInp.onchange = () => {
    const [file] = imgInp.files;
    if (file) {
      blah.src = URL.createObjectURL(file);
    }
  };

  // Preview img update product
  const updateimgInp = document.getElementById("updateimg");
  const updateblah = document.getElementById("updateblah");
  updateimgInp.onchange = () => {
    const [file] = updateimgInp.files;
    if (file) {
      updateblah.src = URL.createObjectURL(file);
    }
  };

  const productForm = document.getElementById("productForm");

  // Add product form
  productForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const imgFile = document.getElementById("img").files[0]; // Get the first file from the input (assuming single file upload)
    const name = document.getElementById("name").value;
    const code = document.getElementById("code").value;
    const price = document.getElementById("price").value;

    const formData = new FormData();
    formData.append("img_name", imgFile); // Append the image file to FormData
    formData.append("name", name);
    formData.append("code", code);
    formData.append("price", price);

    console.log("Submitting form with data:", formData);

    fetch("/addProd", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        window.location.reload(); // Reload the page after successful submission
      })
      .then((data) => {
        console.log("Response from server:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  // Show update form
  window.updateForm = function (productId) {
    fetch(`/getProd/${productId}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("updatename").value = data.name;
        document.getElementById("updatecode").value = data.code;
        document.getElementById("updateprice").value = data.price;

        // Show the update form
        let updateForm = document.getElementsByClassName("updateForm")[0];
        updateForm.style.display = "block";

        // Submit update form
        const productupdateForm = document.getElementById("productupdateForm");
        productupdateForm.addEventListener("submit", function (event) {
          event.preventDefault();

          const imgFile = document.getElementById("updateimg").files[0];
          const name = document.getElementById("updatename").value;
          const code = document.getElementById("updatecode").value;
          const price = document.getElementById("updateprice").value;

          const formData = new FormData();
          formData.append("img_name", imgFile);
          formData.append("name", name);
          formData.append("code", code);
          formData.append("price", price);

          console.log("Submitting update form with data:", formData);

          // Send data to server using fetch
          fetch(`/updateProd/${productId}`, {
            method: "PATCH",
            body: formData,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => {
              console.log("Response from server:", data);
              window.location.reload();
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  };
});
