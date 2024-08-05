import { Component, HostListener, OnInit } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  // ustensilsList: any
  uniqueUstensilList : any;
  selected: string = '';
  searchQuery: string = '';
  filteredResults: any[] = [];
  showSuggestions: boolean = false;
  filteredIngredientList: string[] = [];
  filteredAppareilList: any;
  filteredUstensilList: any;
  ingredient = '';
  appareils = '';
  ustensils = '';

  constructor(private service: ServiceService) { }


  ngOnInit() {
    this.filteredResults = [];
    this.searchQuery = '';
    this.selected = '';
    this.ingredient = '';
    this.appareils = '';
    this.ustensils = '';
    this.loadData();
    this.getIngredients();
    this.getAppareil()
    this.getUniqueUstensils();
  }

  toggleDropdown(dropdown: 'ingredients' | 'appareils' | 'ustensiles') {
    this.dropdowns[dropdown] = !this.dropdowns[dropdown];
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.btn-group')) {
      this.dropdowns.ingredients = false;
      this.dropdowns.appareils = false;
      this.dropdowns.ustensiles=false;
    }
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

  getUniqueUstensils() {
    // Assurez-vous que 'data' est bien défini et contient des objets avec la propriété 'ustensils'
    if (this.data && Array.isArray(this.data)) {
        // Extraire tous les ustensiles en les aplatissant en une seule liste
        const allUstensils = this.data.flatMap((item: any) => item.ustensils);

        // Filtrer les doublons en utilisant un Set
        const uniqueUstensils = [...new Set(allUstensils)];

        // Stocker les ustensiles uniques dans une liste
        this.uniqueUstensilList = uniqueUstensils;
        this.filteredUstensilList = uniqueUstensils

        // Afficher la liste des ustensiles uniques dans la console
        console.log("Unique Ustensils List: ", this.uniqueUstensilList);
    } else {
        this.uniqueUstensilList = []; // Réinitialiser si 'data' n'est pas défini ou n'est pas un tableau
    }
  }

  getIngredients() {
    this.service.getData().subscribe(
      data => {
        const ingredientsSet = new Set<string>();

        data.forEach((item: any) => {
          item.ingredients.forEach((ingredient: any) => {
            ingredientsSet.add(ingredient.ingredient);
          });
        });

        const uniqueIngredients = Array.from(ingredientsSet);
        console.log("uniqueIngredients", uniqueIngredients);

        // Vous pouvez utiliser uniqueIngredients comme vous le souhaitez
        this.ingredientList = uniqueIngredients; // Par exemple, pour l'afficher dans le template
        this.filteredIngredientList = uniqueIngredients
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
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
      this.filteredAppareilList = this.appareilList
    })

  }

  searchIngredient(ingredient: string) {
    console.log(ingredient);
    this.selected = ingredient;
    this.service.getData().subscribe(
      data => {
        this.data = data.sort((a: any, b: any) => {
          const aHasIngredient = a.ingredients.some((ing: any) => ing.ingredient === ingredient);
          const bHasIngredient = b.ingredients.some((ing: any) => ing.ingredient === ingredient);

          if (aHasIngredient && !bHasIngredient) {
            return -1;
          } else if (!aHasIngredient && bHasIngredient) {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });

        console.log(this.data);
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
  }

  searchUstensils(ustensil: string) {
    console.log(ustensil);
    this.selected = ustensil;
    this.service.getData().subscribe(
      data => {
        // Trier les données en mettant les éléments avec l'ustensile sélectionné en premier
        this.data = data.sort((a: any, b: any) => {
          const aHasUstensil = a.ustensils.includes(ustensil);
          const bHasUstensil = b.ustensils.includes(ustensil);

          if (aHasUstensil && !bHasUstensil) {
            return -1; // a doit être placé avant b
          } else if (!aHasUstensil && bHasUstensil) {
            return 1; // b doit être placé avant a
          } else {
            // Trier le reste par ordre alphabétique
            return 0;
          }
        });

        console.log(this.data);
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
  }

  searchAppareil(appareil: string){
    this.selected = appareil;
    this.service.getData().subscribe(
      data => {
        // Trier les données en mettant les éléments avec 'regent' en premier
        this.data = data.sort((a:any, b:any) => {
          if (a.appliance === appareil) {
            return -1; // a doit être placé avant b
          } else if (b.appliance === appareil) {
            return 1; // b doit être placé avant a
          } else {
            return a.appliance.localeCompare(b.appliance); // Trier le reste par ordre alphabétique
          }
        });
        console.log(this.data);
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
  }

  //
  onSearch(event: any) {

    const query = event.target.value.toLowerCase();
    if (query.length >= 3) {
      this.filteredResults = this.data.filter((item: any) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.ingredients.some((ing: any) => ing.ingredient.toLowerCase().includes(query))
      );
      // this.showSuggestions = this.filteredResults.length > 0;
      this.showSuggestions = true

      if(!this.filteredResults){
        this.filteredResults = [];
      }
    }
    else{
      this.showSuggestions = false
    }
  }

  selectResult(result: any) {
    this.searchQuery = result.name || result.ingredient || result.description;
    this.selected = result.name
    // console.log("", this.selected)
    console.log(result); // Gérer la sélection de l'utilisateur ici
    this.data = [result];
    this.showSuggestions = false; // Masquer les suggestions après sélection
  }

  onFocus() {
    this.showSuggestions = this.filteredResults.length > 0;
  }

  onBlur() {
    // Ajoutez un petit délai pour permettre à l'événement de clic de se déclencher avant de masquer les suggestions
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }


  nativeSearch(){
    this.showSuggestions = !this.showSuggestions;
    console.log(this.searchQuery)
    if (this.searchQuery.length >= 3) {
      this.selected = this.searchQuery
      let results = [];
      for (let i = 0; i < this.data.length; i++) {
        const item = this.data[i];
        if (item.name.toLowerCase().includes(this.searchQuery) || item.description.toLowerCase().includes(this.searchQuery)) {
          results.push(item);
        } else {
          for (let j = 0; j < item.ingredients.length; j++) {
            const ing = item.ingredients[j];
            if (ing.ingredient.toLowerCase().includes(this.searchQuery)) {
              results.push(item);
              break;
            }
          }
        }
      }
      console.log("result : ", results)
      this.filteredResults = results;
      this.data = results
      this.showSuggestions = true;
      if(!this.filteredResults){
        this.filteredResults = [];
      }
    } else {
      this.showSuggestions = false;
    }
  }

  //

  filterIngredients(event: any) {
    const query = event.target.value.toLowerCase();
    console.log("ingredient: ", query)
    this.filteredIngredientList = this.ingredientList.filter((item:any )=> item.toLowerCase().includes(query));
    this.dropdowns.ingredients = true;
    console.log(this.filterIngredients)
  }

  filterAppareil(event: any) {
    const query = event.target.value.toLowerCase();
    console.log("Appareil: ", query)
    console.log("Appareil: ", this.appareilList)
    this.filteredAppareilList = this.appareilList.filter((item:any )=> item.appliance.toLowerCase().includes(query));
    this.dropdowns.appareils = true;
    console.log(this.filteredAppareilList)
  }

  filterUstensil(event: any) {
    const query = event.target.value.toLowerCase();
    console.log("Ustensil query: ", query);

    // Assurez-vous que 'data' est bien défini et contient des objets avec la propriété 'ustensils'
    if (this.data && Array.isArray(this.data)) {
        // Filtrer les ustensiles en fonction de la requête utilisateur
        this.filteredUstensilList = this.data.flatMap((item: any) =>
            item.ustensils.filter((ustensil: string) =>
                ustensil.toLowerCase().includes(query)
            )
        );

        // Éliminer les doublons
        this.filteredUstensilList = [...new Set(this.filteredUstensilList)];
    } else {
        this.filteredUstensilList = []; // Réinitialiser si 'data' n'est pas défini ou n'est pas un tableau
    }

    // Mettre à jour la visibilité du menu déroulant
    this.dropdowns.ustensiles = true;

    // Afficher les résultats filtrés dans la console
    console.log("Filtered Ustensil List: ", this.filteredUstensilList);
}



}
