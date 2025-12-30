
// URLs for your Google Sheets (Direct CSV Export Links)
const lostItemsSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShKVtw7qPDWePdM3WXNr58trxBh92JqIzEcAQCltqJgS5Zz0_Mf_yei0jkBAToht2NzPCgkAaZqlsI/pub?output=csv";
const foundItemsSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQi_Hvq_Mg7XTNwyYhSixWgMWoJK2YDK3img0ubW-GEVKo4KWWiiLW7qb1tCKcQUlGciDhgDykG7ZAU/pub?output=csv";

// Arrays to hold the fetched lost and found items
let lostItemsData = [];
let foundItemsData = [];

async function fetchData(sheetURL, containerId, isLostItems = true) {
    try {
        const response = await fetch(sheetURL);
        if (!response.ok) throw new Error("Failed to fetch data");

        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true });
        const rows = parsed.data.filter(row => row.Name && row.Description);

        const content = rows.map(row => {
            const item = {
                name: row.Name || "Unnamed User",
                contactInfo: row.Contact || "No contact provided",
                description: row.Description || "No description available",
                dateLost: row["Date Lost"] || "Not provided",
                locationLost: row["Location Lost"] || "Not provided",
            };

            if (isLostItems) {
                lostItemsData.push(item);
            } else {
                foundItemsData.push(item);
            }

            return `
                <div class="item">
                    <h3>${item.name}</h3>
                    <p><strong>Contact:</strong> ${item.contactInfo}</p>
                    <p><strong>Description:</strong> ${item.description}</p>
                    <p><strong>Date:</strong> ${item.dateLost}</p>
                    <p><strong>Location:</strong> ${item.locationLost}</p>
                </div>
            `;
        }).join("");

        document.getElementById(containerId).innerHTML = content || "<p>No items found.</p>";

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById(containerId).innerHTML = "<p>Error loading data.</p>";
    }
}

function checkMatch() {
    const matchedItems = [];

    lostItemsData.forEach(lostItem => {
        foundItemsData.forEach(foundItem => {
            const lostDesc = lostItem.description.toLowerCase();
            const foundDesc = foundItem.description.toLowerCase();

            // ✅ Partial match instead of exact
            if (lostDesc.includes(foundDesc) || foundDesc.includes(lostDesc)) {
                matchedItems.push({ lostItem, foundItem });
            }
        });
    });

    const notification = document.getElementById("notification");
    const matchedItemElement = document.getElementById("matched-item");

    if (matchedItems.length > 0) {
        let matchedItemText = "";
        matchedItems.forEach((match, i) => {
            matchedItemText += `
                Match ${i + 1}:
                Lost Item: ${match.lostItem.name} (${match.lostItem.description})
                Found Item: ${match.foundItem.name} (${match.foundItem.description})
                ----------------------------
            `;
        });

        matchedItemElement.textContent = matchedItemText;
        notification.style.display = "block";
    } else {
        notification.style.display = "none";
        alert("No matches found!");
    }
}

fetchData(lostItemsSheetURL, "lost-items-container", true);
fetchData(foundItemsSheetURL, "found-items-container", false);

// Add event listener for the 'Check Match' button
document.getElementById('check-match-button').addEventListener('click', checkMatch);
