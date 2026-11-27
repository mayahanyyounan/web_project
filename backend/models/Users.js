const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 20 ,match: [/^[A-Za-z0-9_]+$/, "Username can only contain letters, numbers and underscores"]},
    email: { type: String, required: true, unique: true, lowercase: true, trim: true,  match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Invalid email address"] },
    password: { type: String, required: true, minlength: 6, select: false },
    displayName: { type: String, trim: true, maxlength: 30, default: "" },
    bio: { type: String, maxlength:300, default: "", trim: true},
    avatar: { type: String, default: "" },
  },
  { timestamps: true } //creates the createdAt
);

// Hash the password before saving, but only if it was set or changed
userSchema.pre("save", async function () { //runs your this function before saving the document 
  if (!this.isModified("password")) return; //checks whether the password was changes or newly assigned 
  this.password = await bcrypt.hash(this.password, 10);// the actual hashing 
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password); //make sure the password is correct
};

userSchema.methods.toPublic = function (){
    return {
        id:this.id,
        username: this.username,
        displayName: this.displayName,
        bio: this.bio,
        avatar: this.avatar,
        createdAt: this.createdAt
    };
};

userSchema.methods.toPrivate = function (){
    return{
        id:this.id,
        username: this.username,
        displayName: this.displayName,
        bio: this.bio,
        avatar: this.avatar,
        createdAt: this.createdAt,
        email: this.email
    };
};

//create a unique index on username that ignores upper and lower case
userSchema.index({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("User", userSchema);