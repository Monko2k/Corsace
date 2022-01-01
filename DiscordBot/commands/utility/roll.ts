import { Message } from "discord.js";
import { Command } from "../index";
async function command (m: Message) {
    const rollRegex = /roll\s*(\S+)/i;
    let number = 100;
    if (rollRegex.test(m.content)) {
        const res = rollRegex.exec(m.content);
        if (res) {
            number = Number(res[1]);
            if (isNaN(number))
                number = 100;
            if (number <= 0) {
                m.channel.send("Give a number >=1 mate.");
                return;
            }
        }
    }
    const random = Math.floor(Math.random() * (number - 1) + 1);
    m.channel.send(random.toString());
    return;
}

const roll: Command = {
    name: ["roll"], 
    description: "Gives a number between 1 to num",
    usage: "!roll [num]", 
    category: "utility",
    command,
};

export default roll;