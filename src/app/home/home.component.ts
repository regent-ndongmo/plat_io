import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  data: any;
  dropdowns: { [key in 'ingredients' | 'appareils' | 'ustensiles']: boolean } = {
    ingredients: false,
    appareils: false,
    ustensiles: false
  };

  ingredientList : any;
  appareilList : any;
  ustensilsList: any

  constructor(private service: ServiceService) { }


  ngOnInit() {
    this.loadData();
    this.getIngredient();
    this.getAppareil()
  }

  toggleDropdown(dropdown: 'ingredients' | 'appareils' | 'ustensiles') {
    this.dropdowns[dropdown] = !this.dropdowns[dropdown];
  }

  loadData() {
    this.service.getData().subscribe(
      data => {
        this.data = data;
        console.log(this.data);
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
  }

  getIngredient(){
    // Filtrer les données pour n'avoir qu'un seul élément par nom
    this.service.getData().subscribe(data => {
      this.ingredientList = data.reduce((acc:any, curr:any) => {
        if (!acc.some((item:any) => item.ingredients === curr.ingredients)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      console.log(this.ingredientList)
    })

  }

  getAppareil(){
    // Filtrer les données pour n'avoir qu'un seul élément par nom
    this.service.getData().subscribe(data => {
      this.appareilList = data.reduce((acc:any, curr:any) => {
        if (!acc.some((item:any) => item.appliance === curr.appliance)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      console.log(this.appareilList)
    })

  }

}
