const prompt = document.querySelector("#prompt");
const submitBtn = document.querySelector("#submit");
const chatContainer = document.querySelector(".chat-container");
const imageBtn = document.querySelector("#image");
const image = document.querySelector("#image img");
const imageInput = document.querySelector("#image input");

const apiURL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC89iRKhkWSch1nbNRTUKPRujuKoravK-U";
let user = {
  message: null,
  file: {
    mime_type: null,
    data: null,
  },
};

async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");
  let requestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: user.message },
            user.file.data ? [{ inline_data: user.file }] : [],
          ],
        },
      ],
    }),
  };
  try {
    let response = await fetch(apiURL, requestOption);
    let data = await response.json();

    let apiResponse = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    text.innerHTML = apiResponse;
  } catch (error) {
    console.log(error);
  } finally {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
    image.src = `img.svg`;
    image.classList.remove("choose");
    user.file = {};
  }
}

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  //return div, which is then caught by handleChatResponse when called.
  return div;
}

function handleChatResponse(message) {
  user.message = message; //in the object user the property data is null, but here it is assigned the value of message
  let html = ` <img src="user.png" alt="" id="userImage" width="8%" />
            <div class="user-chat-area">
                ${user.message}
                ${
                  user.file.data
                    ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />`
                    : ""
                }
            </div>`;

  prompt.value = "";
  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);
  //to autoscroll when responses exceed the size of container
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth",
  });

  setTimeout(() => {
    let html = `<img src="ai.png" alt="" id="aiImage" width="10%" />
            <div class="ai-chat-area">
              <img src="loading.webp" alt="" class="load" width='50px'>  
            </div>`;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleChatResponse(prompt.value);
  }
});

submitBtn.addEventListener('click', ()=>{
  handleChatResponse(prompt.value);
})

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type,
      data: base64string,
    };
    image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
    image.classList.add("choose");
  };

  reader.readAsDataURL(file);
});
imageBtn.addEventListener("click", () => {
  imageInput.click();
});
