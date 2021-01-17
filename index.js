const cfg = {
    // Steam Web API Key
    key: "",

    // SteamID64
    steamid: "",

    // Rust APP ID.  If you change, not sure if it will work.
    appid: "252490"
};

const axios = require('axios');
const queryString = require('query-string');

function stack()
{
    axios.get(`http://steamcommunity.com/profiles/${cfg.steamid}/inventory/json/${cfg.appid}/2`)
        .then(async (res) =>
        {
            let stack_to = [];
            let items = Object.values(res.data.rgInventory);

            for (let i = 0; i < items.length; i++)
            {
                items[i].market_hash_name = res.data.rgDescriptions[items[i].classid + "_" + items[i].instanceid].market_hash_name;
            }

            items = items.sort((a, b) => Number(b.amount) - Number(a.amount));

            for (let i = 0; i < items.length; i++)
            {
                let item = items[i];

                if (stack_to.some(x => x.market_hash_name === item.market_hash_name))
                {
                    let stack = stack_to.find(x => x.market_hash_name === item.market_hash_name);

                    let qs = {
                        ...cfg,
                        fromitemid: item.id,
                        destitemid: stack.id,
                        quantity: item.amount
                    };

                    console.log(`Stacking ${item.id} to ${stack.id}`);

                    axios.post("https://api.steampowered.com/IInventoryService/CombineItemStacks/v1?" + queryString.stringify(qs))
                        .catch(console.error);

                    await delay(500);
                }
                else
                {
                    stack_to.push(item);
                }
            }
        })
        .catch(console.error);
}

async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

stack();