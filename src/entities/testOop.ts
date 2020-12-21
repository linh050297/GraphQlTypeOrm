
// abstract class Warrior {
//     readonly name: string; 
//     public weapon: string;
//     constructor(name: string) {
//       this.name = name;
//     }
//     sayHi(): void {
//       console.log(`Hello, I am ${this.name}`);
//     }  
  
//     abstract arm(weapon: string): void; // hàm này phải được triển khai ở lớp dẫn xuất 
//   }
  
//   class SuperWarrior extends Warrior {
//     constructor(name: string) {
//       super(name); // hàm khởi tạo trong lớp dẫn xuất phải gọi super()
//     }
//     arm(weapon: any): void {
//       console.log(`${this.name} is a super warrior fighting with ${weapon}`);
//     }
//     fly(): void {
//       console.log(`${this.name} can fly`);
//     }

//     sayHi():void{
//         console.log('say hi ');
//     }
//   }
  
//   let hercules: Warrior; // đúng! nếu tạo một tham chiếu với kiểu dữ liệu là lớp trừu tượng 
//   hercules = new Warrior('dfgfdg'); // lỗi: không thể tạo một thể hiện của lớp trừu tượng 
//   hercules = new SuperWarrior('abc'); // đúng! thể hiện được tạo ra từ lớp con của lớp trừu tượng 
//   hercules.arm('bua');
//   hercules.sayHi();
//   hercules.fly(); // lỗi: phương thức không tồn tại trong lớp trừu tượng.
//   hercules.sayHi(); 


/////////////// 

// class Hero  {
//     private name: string;
//     constructor(theName: string) { this.name = theName; }
//     public getName () {
//         return this.name;
//     }
// }

// const hercules = new Hero('Hercules')
// hercules.name // Lỗi, 'name' là private 
// hercules.getName() // Ok, vì phương thức getName là public 

// class Superman extends Hero {
//     constructor() { super("Superman"); }
//     sayHi() {
//       console.log(this.name)
//     }
// }
// /////////////
// class Fish {
//     public habitat: string;
//     public length: string;
//     constructor(habitat:string, length:string) {
//         this.habitat = habitat
//         this.length = length
//     }
    
//     renderProperties(element:string) {
//         console.log(element);
//     }
// }

// class Trout extends Fish {
//     public variety: string;
//     constructor(habitat:string, length:string, variety:string) {
//         super(habitat, length)
//         this.variety = variety
//     }
  
//     renderPropertiesWithSuper(element:string) {
//         element = 'abc';
//         super.renderProperties(element);
//     }
// };

// ////////////

// interface TaskInter{
//     id: number
//     name: string
// }

// class TaskSer {
//     public static username: string = "linh"
//     static tasks: TaskInter[];

//     constructor(tasks: TaskInter[]){
//         TaskSer.tasks = tasks;
//     }

//     static getItems(){
//         return TaskSer.tasks
//     };

//     static showItemInfo():void{
//         for (const task of TaskSer.tasks) {
//             console.log('task:',task);
//         }
//     }
// };

// let taskSerObj = new TaskSer([
//     {id: 1, name:'linhnhlinh'},
//     {id:2, name: 'van'}
// ]);

// console.log(TaskSer.username);
// console.log(TaskSer.getItems());
// console.log(TaskSer.showItemInfo());

// ///////////////

// class Course{
//     private oldName:string;

//     constructor(name:string) {
//         this.oldName = name;
//     }

//     showCourseInfo():void{
//         console.log(`${this.oldName}`);
//     };

//     public get getName(){
//         return this.oldName
//     };

//     public set setName(name:string){
//         this.oldName = name
//     }
// }

// var courseObj = new Course('name nè');
// console.log('name:', courseObj.getName);

// courseObj.setName = 'name mới nè';
// console.log('newName:', courseObj.getName);


// ////////////////
// abstract class Laptop{
//     public keyboard():void{
//         console.log('laptop keyboard');
//     }

//     public mainboard():void{
//         console.log('mainboard');
//     }

//     public abstract  chipset(abc:string):string;
// }

// class laptopDell extends Laptop{
//     public keyboard():void{
//         console.log('laptopDell.laptop keyboard');
//     }

//     public chipset(abc:string):string{
//         console.log(abc);
//         return abc;
//     }
// }

// let laptopObj: Laptop = new laptopDell();
// laptopObj.keyboard();
// laptopObj.mainboard();
// laptopObj.chipset('asdadadasd');
// ///////////////

// interface People{
//     name: string
//     eat(): void
//     sleep():void
// };

// interface Bird{
//     fly():void
// };

// class Machine{
//     caculate(x:number, y:number):number{
//         return x+y;
//     }
// }

// class Superman extends Machine implements People, Bird{
//     name: string;

//     constructor(name:string){
//         super();
//         this.name = name
//     }
//     eat():void{
//         console.log('eat')
//     }
//     sleep():void{
//         console.log('sleep');
//     };
//     fly():void{
//         console.log('fly');
//     }
    
// }

// let join: Superman = new Superman('john');
// console.log(join);
// join.eat();
// join.sleep();
// join.fly();
// console.log(join.caculate(5,6));

///////////////////
